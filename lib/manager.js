var Bookshelf = require('bookshelf');
var hooker    = require('hooker');
var path      = require('path');
var Promise   = require('bluebird');

var Manager = function(bookshelf, root) {
  this.bookshelf  = bookshelf;
  this.knex       = bookshelf.knex;
  this.schema     = bookshelf.knex.schema;
  this.root       = path.normalize(root);

  bookshelf.plugin('registry');

  hooker.hook(bookshelf, ['collection', 'model'], function(name, value) {
    if (!value) {
      return hooker.preempt(this.get(name));
    }
  }.bind(this));
};

Manager.prototype.cache = {};

Manager.prototype.create = function(name, properties) {
  var Model = this.get(name);
  var model = new Model();

  return this.save(model, properties).catch(function(error) {
    console.error(error);
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

Manager.prototype.get = function(name) {
  if (this.isModel(name) || this.isCollection(name)) {
    return name;
  } else if (typeof name !== 'string') {
    throw new Error('Expected a String, Model, or Collection, not: ' + typeof name);
  }

  if (this.cache[name]) {
    return this.cache[name];
  }

  var file  = path.join(this.root, name);
  var Model = require(file);

  if (this.isModel(Model)) {
    this.cache[name] = this.bookshelf.model(name, Model);
  } else if (this.isCollection(Model)) {
    this.cache[name] = this.bookshelf.collection(name, Model);

    if (typeof Model.prototype.model === 'string') {
      Model.prototype.model = this.get(Model.prototype.model);
    }
  } else {
    throw new Error('`' + name + '` should be an instance of Model or Collection, not ' + typeof Model.prototype);
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

Manager.prototype.save = function(model, properties) {
  if (this.isModel(model)) {
    return this.saveModel(model, properties);
  } else if (this.isCollection(model)) {
    return this.saveCollection(model, properties);
  } else {
    throw new Error('Object should be an instance of Model or Collection, not ' + typeof model);
  }
};

Manager.prototype.saveCollection = function(collection, models) {
  return collection.invokeThen('save').then(function() {
    return this.set(collection, models);
  }.bind(this)).then(function() {
    return collection.invokeThen('save');
  }).then(function() {
    return collection;
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
        existing.detach(model);
      }
    });
  }).then(function() {
    return collection.mapThen(function(model) {
      if (!existing.get(model.id)) {
        existing.attach(model);
      }
    });
  });
};

Manager.prototype.setHasMany = function(model, key, models, relation) {
  var Collection = this.bookshelf.Collection.extend({
    model: relation.relatedData.target,
  });

  var collection  = Collection.forge();
  var existing    = model.related(key);;

  return existing.fetch().then(function() {
    return this.setCollection(collection, models);
  }.bind(this)).then(function() {
    var fk = relation.relatedData.foreignKey;

    if (!fk) {
      throw new Error('`' + key + '` relation is missing `foreignKey` in `this.hasMany(Target, foreignKey)`');
    }

    return collection.mapThen(function(model) {
      model.set(fk, model.id);

      return model.save();
    });
  }).then(function() {
    return existing.mapThen(function(model) {
      if (!collection.get(model.id)) {
        return model.destroy();
      }
    })
  }).then(function() {
    return collection.mapThen(function(model) {
      if (!existing.get(model.id)) {
        existing.add(model);
      }
    })
  });
};

Manager.prototype.setScalar = Promise.method(function(model, key, value) {
  model.set(key, value);

  return model;
});

Manager.prototype.setCollection = Promise.method(function(collection, models) {
  var promises = [];

  models = models || [];

  models.forEach(function(model) {
    if (this.isModel(model)) {
      promises.push(
        model.save().then(function(model) {
          collection.add(model);
        })
      );
    } else {
      promises.push(
        this.create(collection.model, model).then(function(model) {
          collection.add(model);
        })
      );
    }
  }.bind(this));

  return Promise.all(promises).then(function() {
    return collection;
  });
});

module.exports = Manager;
