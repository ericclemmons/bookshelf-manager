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

Manager.prototype.create = function(name) {
  var Model = this.get(name);
  var model = new Model();

  return model;
};

Manager.prototype.fetch = function(name, properties, related) {
  return this.forge(name, properties).fetch({
    withRelated: related,
  });
};

Manager.prototype.forge = function(name, properties) {
  var model = this.create(name);

  return this.set(model, properties);
};

Manager.prototype.get = function(name) {
  if (typeof name !== 'string') {
    return name;
  }

  if (this.cache[name]) {
    return this.cache[name];
  }

  var file  = path.join(this.root, name);
  var Model = require(file);
  var proto = Model.prototype;

  if (proto instanceof this.bookshelf.Model) {
    this.cache[name] = this.bookshelf.model(name, Model);
  } else if (proto instanceof this.bookshelf.Collection) {
    this.cache[name] = this.bookshelf.collection(name, Model);

    if (typeof proto.model === 'string') {
      proto.model = this.get(proto.model);
    }
  } else {
    throw new Error('`' + name + '` should be an instance of Model or Collection, not ' + typeof Model.prototype);
  }

  return Model;
};

Manager.prototype.save = function(model, properties) {
  if (typeof model === 'string') {
    model = this.forge(model);
  }

  var promise;

  return this.set(model, properties).then(function() {
    return model instanceof this.bookshelf.Model ? model.save() : model.invokeThen('save')
  }.bind(this));
};

Manager.prototype.set = function(instance, properties) {
  if (instance instanceof this.bookshelf.Model) {
    return this.setModel(instance, properties);
  } else if (instance instanceof this.bookshelf.Collection) {
    return this.setCollection(instance, properties);
  }

  throw new Error('`' + name + '` should be an instance of Model or Collection, not ' + typeof Model.prototype);
};

Manager.prototype.setModel = Promise.method(function(model, properties) {
  var promises = [];

  for (var key in properties) {
    if (!properties.hasOwnProperty(key)) {
      continue;
    }

    var value = properties[key];

    promises.push(new Promise(function(resolve) {
      model.set(key, value);
      resolve(model);
    }));
  }

  return Promise.all(promises).then(function() {
    return model;
  });
});

Manager.prototype.setCollection = Promise.method(function(collection, models) {
  var promises = [];

  Promise.map(models, function(model) {
    if (model instanceof this.bookshelf.Model) {
      return new Promise(function(resolve) {
        collection.add(model);
        resolve(collection);
      });
    }

    var Model = this.get(collection.prototype.model);

    return this.setModel(new Model(), model).then(function(model) {
      collection.add(model);
    });
  }.bind(this));

  return Promise.all(promises).then(function() {
    return collection;
  });
});

Manager.prototype.setBelongsTo = function(model, relation, properties) {
  return relation.target.forge(properties).save().then(function(target) {
    model[relation.foreignKey] = target.get('id')
  });
}

module.exports = Manager;
