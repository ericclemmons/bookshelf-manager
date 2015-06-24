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

Manager.prototype.debug = function(debug) {
  var level = 1;
  var methods = [
    'create',
    'fetch',
    'forge',
    'get',
    'load',
    'save',
    'saveCollection',
    'saveModel',
    'set',
    'setBelongsTo',
    'setBelongsToMany',
    'setCollection',
    'setHasMany',
    'setModel',
    'setScalar',
  ];

  var pre = function(name) {
    var indent  = new Array(level++).join('  ');
    var sliced  = Array.prototype.slice.call(arguments, 1);
    var args    = sliced.map(function(arg) {
      if (this.isCollection(arg)) {
        return '[Collection] (' + arg.length + ')';
      }

      if (this.isModel(arg)) {
        return '[Model `' + arg.tableName + '@' + arg.id + '`]';
      }

      return (JSON.stringify(arg) || 'null').split('\n').join('\n' + indent + '   ');
    }.bind(this)).join(',\n' + indent + '   ');

    console.log(indent, '<' + name + '>', '\n' + indent + '  ', args);
  };

  var post = function(result, name) {
    if (result && result.then) {
      result.then(function() {
        console.log(new Array(--level).join('  '), '</' + name + '>');

        return arguments[0];
      });
    };
  };

  if (typeof debug === 'undefined') {
    debug = true;
  }

  if (debug) {
    hooker.hook(this, methods, {
      passName: true,
      pre:      pre,
      post:     post
    });
  } else {
    hooker.unhook(this, methods);
  }

  return this;
};

Manager.prototype.fetch = function(name, properties, related) {
  var model = this.forge(name, properties);

  return model.fetch({
    withRelated: related,
  });
};

Manager.prototype.findRelated = function(properties, paths) {
  var related = [];

  properties  = properties || {};
  paths       = paths || [];

  for (var key in properties) {
    var value = properties[key];
    var ctor  = value ? value.constructor : null;

    if (ctor === Array) {
      related.push(paths.concat([key]).join('.'));

      if (value.length) {
        related = related.concat(this.findRelated(value[0], paths.concat([key])));
      }
    }

    if (ctor === Object) {
      related.push(paths.concat([key]).join('.'));

      related = related.concat(this.findRelated(value, paths.concat([key])));
    }
  }

  return related;
};

Manager.prototype.forge = function(name, properties) {
  var Model = this.get(name);

  // Model may already be instantiated
  if (Model instanceof this.bookshelf.Model) {
    Model = Model.constructor;
  }

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
    throw new Error('Expected a String, Model, Collection, or a Managed Model/Collection, got: ' + typeof Model);
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
  if (!model || this.isCollection(model)) {
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
  }

  throw new Error('Object should be an instance of Model or Collection, not ' + typeof model);
};

Manager.prototype.saveCollection = function(collection, models) {
  return collection.mapThen(function(model) {
    return (model.isNew() || model.hasChanged()) ? model.save() : model;
  }).then(function() {
    return this.setCollection(collection, models);
  }.bind(this)).then(function(targets) {
    return targets.mapThen(function(target) {
      collection.add(target);

      return (target.isNew() || target.hasChanged()) ? target.save() : target;
    });
  }).then(function() {
    return collection;
  }).catch(function(error) {
    console.error(error.stack);
    throw error;
  });
};

Manager.prototype.saveModel = function(model, properties) {
  return this.setModel(model, properties).then(function(result) {
    return (result.isNew() || result.hasChanged()) ? result.save() : result;
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

Manager.prototype.setModel = function(model, properties) {
  var promises = [];

  properties = properties || {};

  if (model.isNew() && properties && properties.id) {
    promises.push(function() {
      return this.fetch(model, { id: properties.id }, this.findRelated(properties)).then(function(result) {
        return result;
      });
    }.bind(this));
  } else {
    promises.push(function () {
      return model;
    });
  }

  function setProperties (propertyType) {

    Object.keys(properties).forEach(function(key) {
      var value     = properties[key];
      var relation  = model[key] instanceof Function ? model[key].call(model) : null;
      var type      = relation ? relation.relatedData.type : 'scalar';
      var method    = 'set' + type.charAt(0).toUpperCase() + type.slice(1);
      var setter    = this[method].bind(this);

      if ((type === 'scalar' && propertyType === 'scalar') || (type !== 'scalar' && propertyType === 'related')) {
        promises.push(function(result) {
          return setter(result, key, value, relation).then(function() {
            return result;
          });
        });
      }
    }.bind(this));
  }

  setProperties.bind(this)('scalar');

  promises.push(function (result) {
    return (result.isNew() || result.hasChanged()) ? result.save() : result;
  });

  setProperties.bind(this)('related');

  return Promise.reduce(promises, function(result, promise) {
    return promise(result);
  }, []);
};

Manager.prototype.setBelongsTo = function(model, key, value, relation) {
  var Target    = relation.relatedData.target;
  var existing  = model.related(key);
  var target    = existing.isNew() ? Target.forge() : existing.clone();

  return this.save(target, value).then(function(target) {
    var fk = relation.relatedData.foreignKey;

    if (model.get(fk) !== target.id) {
      model.set(fk, target.id);
    }

    model.relations[key] = target;

    return (model.isNew() || model.hasChanged()) ? model.save() : model;
  });
};

Manager.prototype.setBelongsToMany = function(model, key, models, relation) {
  var existing = model.related(key);

  return Promise.cast(existing.length ? existing : existing.fetch()).then(function() {
    return this.setCollection(existing, models);
  }.bind(this)).then(function(targets) {
    // Enforce attach/detach IDs
    existing.relatedData.parentId = model.id;
    existing.relatedData.parentFk = model.id;

    return targets.mapThen(function(target) {
      if (!existing.findWhere({ id: target.id })) {
        return existing.attach(target);
      }
    }).then(function() {
      return existing.mapThen(function(target) {
        if (!targets.findWhere({ id: target.id })) {
          return existing.detach(target);
        }
      });
    });
  }).then(function() {
    return model;
  });
};

Manager.prototype.setHasMany = function(model, key, models, relation) {
  var existing = model.related(key);

  return this.setCollection(existing, models).then(function(targets) {
    var fk = relation.relatedData.foreignKey;

    if (!fk) {
      throw new Error('`' + model.tableName + '#' + key + '` relation is missing `foreignKey` in `this.hasMany(Target, foreignKey)`');
    }

    return targets.mapThen(function(target) {
      var properties = {};

      properties[fk] = model.id;

      return this.save(target, properties).then(function(target) {
        existing.add(target);
      });
    }.bind(this)).then(function() {
      return existing.mapThen(function(target) {
        if (!targets.findWhere({ id: target.id })) {
          return target.destroy();
        }
      });
    });
  }.bind(this)).then(function() {
    return model;
  });
};

Manager.prototype.setScalar = Promise.method(function(model, key, value) {
  if (key.indexOf('_pivot_') === 0) {
    return model;
  }

  if (model.get(key) === value) {
    return model;
  }

  model.set(key, value);

  return model;
});

Manager.prototype.setCollection = function(existing, models) {
  models = models || [];

  return Promise.map(models, function(properties) {
    var model = existing.findWhere({ id: properties.id }) || existing.model.forge();

    return this.save(model, properties);
  }.bind(this)).then(function(results) {
    return this.bookshelf.Collection.forge(results);
  }.bind(this));
};

module.exports = Manager;
