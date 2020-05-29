var path      = require('path');
var Promise   = require('bluebird');

function Manager(bookshelf, options) {

  if (!(arguments.length > 0 && bookshelf && bookshelf.VERSION)) {
    throw new Error('Manager requires a Bookshelf instance');
  }

  this.root = options && options.root ? path.normalize(options.root) : null;

  this.initialize(bookshelf);
}

Manager.plugin = function(bookshelf, options) {
  return new Manager(bookshelf, options);
};

Manager.prototype.register = function(model, name) {

  if (!(arguments.length >= 2 && model && typeof name === 'string')) {
    throw new Error('Manager.register must be called with a model and a model name');
  }

  var Model = this.get(model);

  if (this.isModel(Model)) {
    this.bookshelf.model(name, Model);
  } else if (this.isCollection(Model)) {
    this.bookshelf.collection(name, Model);
  }

  return Model;
};

Manager.prototype.initialize = function(bookshelf) {
  this.bookshelf  = bookshelf;
  this.knex       = this.bookshelf.knex;
  this.schema     = this.knex.schema;
  
  if (typeof bookshelf.collection !== 'function') {
    bookshelf.plugin('registry');
  }

  // Expose the Bookshelf Manager instance on the Bookshelf instance
  bookshelf.manager = this;

  return this;
};

Manager.prototype.create = Promise.method(function(name, properties, options) {
  var Model = this.get(name);
  var model = new Model();

  return this.save(model, properties, options).catch(function(error) {
    console.error(error.stack);
    throw error;
  });
});

Manager.prototype.fetch = Promise.method(function(name, properties, related, options) {
  var model = this.forge(name, properties);

  return model.fetch({
    withRelated: related,
    transacting: options && options.transacting ? options.transacting : null
  });
});

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

    Model = this.bookshelf.collection(name) || this.bookshelf.model(name);

    if (this.isModelOrCollection(Model)) {
      return Model;
    }

    if (this.root) {

      var file = path.join(this.root, name);

      try {
        Model = require(file);
      } catch (e) {
        throw new Error('Could not find module `' + name + '` at `' + file + '.js`');
      }
    } else {
      throw new Error('No model named `' + name + '` has been registered and no model directory was specified');
    }
  }

  if (!this.isModelOrCollection(Model)) {
    Model = Model(this.bookshelf);
  }

  if (!this.isModelOrCollection(Model)) {
    throw new Error('Expected a String, Model, or Collection, got: ' + typeof Model);
  }

  if (this.isCollection(Model) && typeof Model.prototype.model === 'string') {
    Model.prototype.model = this.get(Model.prototype.model);
  }

  if (name) {
    if (this.isModel(Model)) {
      this.bookshelf.model(name, Model);
    } else if (this.isCollection(Model)) {
      this.bookshelf.collection(name, Model);
    }
  }

  return Model;
};

Manager.prototype.isModelOrCollection = function(model) {
  return (this.isModel(model) || this.isCollection(model));
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

Manager.prototype.save = Promise.method(function(model, properties, options) {
  if (this.isModel(model)) {
    return this.saveModel(model, properties, options);
  }

  if (this.isCollection(model)) {
    return this.saveCollection(model, properties, options);
  }

  throw new Error('Object should be an instance of Model or Collection, not ' + typeof model);
});

Manager.prototype.saveCollection = Promise.method(function(collection, models, options) {
  return collection.mapThen(function(model) {
    return (model.isNew() || model.hasChanged()) ? model.save(null, options) : model;
  }).then(function() {
    return this.setCollection(collection, models, options);
  }.bind(this)).then(function(targets) {
    return targets.mapThen(function(target) {
      collection.add(target);

      return (target.isNew() || target.hasChanged()) ? target.save(null, options) : target;
    });
  }).then(function() {
    return collection;
  }).catch(function(error) {
    console.error(error.stack);
    throw error;
  });
});

Manager.prototype.saveModel = Promise.method(function(model, properties, options) {
  return this.setModel(model, properties, options).then(function(result) {
    return (result.isNew() || result.hasChanged()) ? result.save(null, options) : result;
  }).catch(function(error) {
    console.error(error.stack);
    throw error;
  });
});

Manager.prototype.set = Promise.method(function(model, properties, options) {
  if (this.isModel(model)) {
    return this.setModel(model, properties, options);
  }

  if (this.isCollection(model)) {
    return this.setCollection(model, properties, options);
  }

  throw new Error('Object should be an instance of Model or Collection, not ' + typeof model);
});

Manager.prototype.setModel = Promise.method(function(model, properties, options) {
  var promises = [];

  properties = (typeof properties === 'object' && !Array.isArray(properties) && properties !== null) ? properties : {};

  if (model.isNew() && properties && properties.id) {
    promises.push(function() {
      return this.fetch(model, { id: properties.id }, this.findRelated(properties), options).then(function(result) {
        return result;
      });
    }.bind(this));
  } else {
    promises.push(function() {
      return model;
    });
  }

  function setProperties(propertyType) {

    Object.keys(properties).forEach(function(key) {
      var value     = properties[key];
      var relation  = (model[key] instanceof Function && (typeof value === 'object' || Array.isArray(value))) ? model[key].call(model) : null;
      var type      = relation ? relation.relatedData.type : 'scalar';
      var method    = 'set' + type.charAt(0).toUpperCase() + type.slice(1);
      var setter    = this[method].bind(this);

      if ((type === 'scalar' && propertyType === 'scalar') || (type !== 'scalar' && propertyType === 'related')) {
        promises.push(function(result) {
          return setter(result, key, value, relation, options).then(function() {
            return result;
          });
        });
      }
    }.bind(this));
  }

  setProperties.bind(this)('scalar');

  promises.push(function(result) {
    return (result.isNew() || result.hasChanged()) ? result.save(null, options) : result;
  });

  setProperties.bind(this)('related');

  return Promise.reduce(promises, function(result, promise) {
    return promise(result);
  }, []);
});

Manager.prototype.setBelongsTo = Promise.method(function(model, key, value, relation, options) {
  var Target    = relation.relatedData.target;
  var existing  = model.related(key);
  var target    = existing.isNew() ? Target.forge() : existing.clone();
  var fk = relation.relatedData.foreignKey;

  if (value === null) {
    if (model.get(fk)) {
      model.set(fk, null);
    }
    return (model.isNew() || model.hasChanged()) ? model.save(null, options) : model;
  }

  return this.save(target, value, options).then(function(target) {
    if (model.get(fk) !== target.id) {
      model.set(fk, target.id);
    }

    model.relations[key] = target;

    return (model.isNew() || model.hasChanged()) ? model.save(null, options) : model;
  });
});

Manager.prototype.setBelongsToMany = Promise.method(function(model, key, models, relation, options) {
  var existing = model.related(key);

  return Promise.resolve(existing.length ? existing : existing.fetch(options)).then(function() {
    return this.setCollection(existing, models, options);
  }.bind(this)).then(function(targets) {
    // Enforce attach/detach IDs
    existing.relatedData.parentId = model.id;
    existing.relatedData.parentFk = model.id;

    return targets.mapThen(function(target) {
      if (!existing.find(record => record.get('id') === target.id)) {
        return existing.attach(target, options);
      }
    }).then(function() {
      return existing.mapThen(function(target) {
        if (!targets.find(record => record.get('id') === target.id)) {
          return existing.detach(target, options);
        }
      });
    });
  }).then(function() {
    return model;
  });
});

Manager.prototype.setHasOne = Promise.method(function(model, key, value, relation, options) {
  var Target = relation.relatedData.target;
  var existing = Target.forge(model.related(key).attributes);
  var target = Target.forge(value);
  var fk = relation.relatedData.foreignKey;

  return Promise.resolve(existing.isNew() ? null : existing.save(fk, null, options))
  .then(function() {
    return target.save(fk, model.id, options);
  })
  .then(function(target) {
    model.relations[key] = target;
    return model;
  });
});

Manager.prototype.setHasMany = Promise.method(function(model, key, models, relation, options) {
  var existing = model.related(key);

  var fk = relation.relatedData.foreignKey;

  if (!fk) {
    throw new Error('`' + model.tableName + '#' + key + '` relation is missing `foreignKey` in `this.hasMany(Target, foreignKey)`');
  }

  models = models.map(function(target) {
    if (!target[fk]) {
      target[fk] = model.id;
    }
    return target;
  });

  return this.setCollection(existing, models, options).then(function(targets) {

    targets.forEach(function(target) {
      existing.add(target);
    });

    return existing.mapThen(function(target) {
      if (!targets.find(record => record.get('id') === target.id)) {
        return target.destroy(options);
      }
    });
  }).then(function() {
    return model;
  });
});

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

Manager.prototype.setCollection = Promise.method(function(existing, models, options) {
  models = models || [];

  return Promise.map(models, function(properties) {
    var model = existing.find(record => record.get('id') === properties.id) || existing.model.forge();

    return this.save(model, properties, options);
  }.bind(this)).then(function(results) {
    return this.bookshelf.Collection.forge(results);
  }.bind(this));
});

module.exports = Manager;
