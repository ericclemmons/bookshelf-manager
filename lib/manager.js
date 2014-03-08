var Bookshelf = require('bookshelf');
var hooker    = require('hooker');
var path      = require('path');
var Promise   = require('bluebird');

var Manager = function(root, bookshelf) {
  if (!root) {
    throw new Error('Manager requires a path to model directory');
  }

  this.root = path.normalize(root);

  if (bookshelf) {
    this.initialize(bookshelf);
  } else {
    hooker.hook(Bookshelf, 'initialize', {
      once: true,
      post: this.initialize.bind(this)
    });
  }
};

Manager.manage = function(model) {
  if (!Manager.manages(model)) {
    Manager._managed.push(model);
  }

  return model;
};

Manager.manages = function(model) {
  if (!model instanceof Function) {
    return false;
  }

  return Manager._managed.indexOf(model) !== -1
};

Manager._managed = [];

Manager.prototype.initialize = function(bookshelf) {
  this.bookshelf  = bookshelf;
  this.knex       = this.bookshelf.knex;
  this.schema     = this.knex.schema;

  bookshelf.plugin('registry');

  hooker.hook(bookshelf, ['collection', 'model'], function(name, value) {
    if (!value) {
      return hooker.preempt(this.get(name));
    }
  }.bind(this));

  return this;
};

Manager.prototype._cache = {};

Manager.prototype.create = function(name, properties) {
  var Model = this.get(name);
  var model = new Model();

  return this.save(model, properties).catch(function(error) {
    console.error(error.stack);
    throw error;
  });
};

Manager.prototype.fetch = function(name, properties, related) {
  return this.forge(name, properties).fetch({
    withRelated: related,
  });
};

Manager.prototype.forge = function(name, properties) {
  var Model = this.get(name);

  return Model.forge(properties);
};

Manager.prototype.get = function(Model) {
  if (!this.bookshelf) {
    throw new Error('Manager has not been initialized with instance of Bookshelf');
  }

  var name;

  if (typeof Model === 'string') {
    name = Model;

    if (this._cache[name]) {
      return this._cache[name];
    }

    var file = path.join(this.root, name);

    try {
      Model = require(file);
    } catch (e) {
      throw new Error('Could not find module `' + name + '` at `' + file + '.js`');
    }
  }

  if (Manager.manages(Model)) {
    Model = Model(this.bookshelf);
  }

  if (!this.isModel(Model) && !this.isCollection(Model)) {
    throw new Error('Expected a String, Model, Collection, or a Managed Model/Collection, got: ' + typeof name);
  }

  if (this.isCollection(Model) && typeof Model.prototype.model === 'string') {
    Model.prototype.model = this.get(Model.prototype.model);
  }

  if (name) {
    if (this.isModel(Model)) {
      this._cache[name] = this.bookshelf.model(name, Model);
    } else if (this.isCollection(Model)) {
      this._cache[name] = this.bookshelf.collection(name, Model);
    }
  }

  return Model;
};

Manager.prototype.isModel = function(model) {
  if (!model) {
    return false;
  }

  return model instanceof this.bookshelf.Model || model.prototype instanceof this.bookshelf.Model;
};

Manager.prototype.isCollection = function(model) {
  if (!model) {
    return false;
  }

  return model instanceof this.bookshelf.Collection || model.prototype instanceof this.bookshelf.Collection;
};

Manager.prototype.save = Promise.method(function(model, properties) {
  if (this.isModel(model)) {
    return this.saveModel(model, properties);
  } else if (this.isCollection(model)) {
    return this.saveCollection(model, properties);
  }

  throw new Error('Object should be an instance of Model or Collection, not ' + typeof model);
});

Manager.prototype.saveCollection = function(collection, models) {
  return collection.invokeThen('save').then(function() {
    return this.set(collection, models);
  }.bind(this)).then(function() {
    return collection.invokeThen('save');
  }).then(function() {
    return collection;
  }).catch(function(error) {
    console.error(error.stack);
    throw error;
  });
};

Manager.prototype.saveModel = function(model, properties) {
  var promise;

  // If new model is provided & ID is provided, use existing record
  if (!model.id && properties && properties.id) {
    promise = model.constructor.forge({
      id: properties.id
    }).fetch();
  } else {
    promise = model.save();
  }

  return promise.then(function(model) {
    return this.set(model, properties);
  }.bind(this)).then(function(model) {
    return model.save();
  }).catch(function(error) {
    console.error(error.stack);
    throw error;
  });
}

Manager.prototype.set = function(model, properties) {
  if (this.isModel(model)) {
    return this.setModel(model, properties);
  } else if (this.isCollection(model)) {
    return this.setCollection(model, properties);
  }

  throw new Error('Object should be an instance of Model or Collection, not ' + typeof model);
};

Manager.prototype.setModel = Promise.method(function(model, properties) {
  var promises = []

  properties = properties || {};

  if (!model.cid) {
    model = model.forge();
  }

  for (var key in properties) {
    if (!properties.hasOwnProperty(key)) {
      continue;
    }

    var value     = properties[key];
    var relation  = model[key] instanceof Function ? model[key].call(model) : null;
    var type      = relation ? relation.relatedData.type : 'scalar';
    var setter    = 'set' + type.charAt(0).toUpperCase() + type.slice(1);

    if (!this[setter]) {
      throw new Error('Cannot set `' + type + '`.  Missing `Manager.prototype.' + setter + '`.');
    }

    promises.push(
      this[setter].call(this, model, key, value, relation)
    );
  }

  return Promise.all(promises).then(function() {
    return model;
  });
});

Manager.prototype.setBelongsTo = function(model, key, value, relation) {
  var Target  = relation.relatedData.target;

  return this.save(new Target(), value).then(function(target) {
    var fk = relation.relatedData.foreignKey;

    model.set(fk, target.get('id'));

    return target;
  }).then(function(target) {
    return model.related(key).fetch();
  })
};

Manager.prototype.setBelongsToMany = function(model, key, models, relation) {
  var Collection = this.bookshelf.Collection.extend({
    model: relation.relatedData.target,
  });

  var collection  = Collection.forge();
  var existing    = model.related(key);;

  return existing.fetch().then(function() {
    return this.setCollection(collection, models);
  }.bind(this)).then(function() {
    return existing.mapThen(function(model) {
      if (!collection.get(model.id)) {
        return existing.detach(model);
      }
    });
  }).then(function() {
    return collection.mapThen(function(model) {
      if (!existing.get(model.id)) {
        return existing.attach(model);
      }
    });
  });
};

Manager.prototype.setHasMany = function(model, key, targets, relation) {
  var Collection = this.bookshelf.Collection.extend({
    model: relation.relatedData.target,
  });

  var collection  = Collection.forge();
  var existing    = model.related(key);

  return existing.fetch().then(function() {
    return this.setCollection(collection, targets);
  }.bind(this)).then(function() {
    var fk = relation.relatedData.foreignKey;

    if (!fk) {
      throw new Error('`' + key + '` relation is missing `foreignKey` in `this.hasMany(Target, foreignKey)`');
    }

    return collection.mapThen(function(target) {
      var properties = {};

      properties[fk] = model.id;

      return this.save(target, properties);
    }.bind(this));
  }.bind(this)).then(function() {
    return existing.mapThen(function(target) {
      if (!collection.get(target.id)) {
        return target.destroy();
      }
    })
  }).then(function() {
    return collection.mapThen(function(target) {
      if (!existing.get(target.id)) {
        existing.add(target);
      }
    })
  });
};

Manager.prototype.setScalar = Promise.method(function(model, key, value) {
  if (key.indexOf('_pivot_') !== 0) {
    model.set(key, value);
  }

  return model;
});

Manager.prototype.setCollection = Promise.method(function(collection, targets) {
  targets = targets || [];

  return Promise.map(targets, function(target) {
    var promise;

    if (this.isModel(target)) {
      promise = target.save();
    } else {
      promise = this.save(collection.model, target);
    }

    return promise.then(function(target) {
      collection.add(target);

      return target;
    });
  }.bind(this)).then(function() {
    return collection;
  });
});

module.exports = Manager;
