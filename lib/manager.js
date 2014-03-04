var Bookshelf = require('bookshelf');
var hooker    = require('hooker');
var path      = require('path');

var Manager = function(bookshelf, root) {
  this.bookshelf  = bookshelf;
  this.knex       = bookshelf.knex;
  this.schema     = bookshelf.knex.schema;
  this.root       = path.normalize(root);

  bookshelf.plugin('registry');
};

Manager.prototype.fetch = function(name, properties, related) {
  return this.forge(name, properties).fetch({
    withRelated: related,
  });
};

Manager.prototype.forge = function(name, properties) {
  return this.get(name).forge(properties);
};

Manager.prototype.get = function(name) {
  var file  = path.join(this.root, name);
  var Model = require(file);
  var proto = Model.prototype;

  if (proto instanceof this.bookshelf.Model) {
    this.bookshelf.model(name, Model);

    hooker.hook(Model.prototype, ['hasMany', 'hasOne', 'belongsToMany', 'morphOne', 'morphMany', 'belongsTo', 'through'], function(target) {
      this.get(target);
    }.bind(this));
  } else if (proto instanceof this.bookshelf.Collection) {
    this.bookshelf.collection(name, Model);

    if (typeof proto.model === 'string') {
      proto.model = this.get(proto.model);
    }

    hooker.hook(Model.prototype, 'morphTo', function(target) {
      this.get(target);
    }.bind(this));
  } else {
    throw new Error('`' + name + '` should be an instance of Model or Collection, not ' + typeof Model.prototype);
  }

  return Model;
};

Manager.prototype.save = function(model, properties) {
  if (typeof model === 'string') {
    model = this.forge(model, properties);
  } else {
    this.set(model, properties);
  }

  return model instanceof this.bookshelf.Model ? model.save() : model.invokeThen('save');
};

Manager.prototype.set = function(model, properties) {
  for (var key in properties) {
    var submitted = properties[key];

    model.set(key, submitted);
  }
};

module.exports = Manager;
