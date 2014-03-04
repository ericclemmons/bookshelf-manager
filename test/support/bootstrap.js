var Promise = require('bluebird');

var manager = require('./manager');
var MySql   = require('../databases/mysql');
var Test    = require('../databases/test');

var Bootstrap = {};

Bootstrap.before = function(promise) {
  if (!promise) {
    throw new Error(typeof promise + ' is not a promise');
  }

  before(function(done) {
    promise().then(done.bind(this, null), done);
  });
};

Bootstrap.database = function() {
  return MySql.knex.raw('DROP DATABASE IF EXISTS bookshelf_manager_test')
    .then(function() {
      return MySql.knex.raw('CREATE DATABASE bookshelf_manager_test');
    })
  ;
};

Bootstrap.fixtures = function() {
  var make    = manager.forge('make',    { name: 'BMW' });
  var model   = manager.forge('model',   { name: 'X5', base_price: '50000.00' });
  var type    = manager.forge('type',    { name: 'Crossover' });
  var specs   = manager.forge('specs',   [ { name: '4 door'}, { name: 'v6' } ]);
  var color   = manager.forge('color',   { name: 'grey', hex_value: '#666' });
  var dealer  = manager.forge('dealer',  { name: 'Houston', zip_code: '77002' });

  return make.save()
    .then(function() {
      return type.save();
    })
    .then(function() {
      return Promise.all(specs.invoke('save'));
    })
    .then(function() {
      return color.save();
    })
    .then(function() {
      model.set('make_id', make.get('id'));
      model.set('type_id', type.get('id'));

      return model.save();
    })
    .then(function() {
      model.specs().attach(specs.pluck('id'));
    })
    .then(function() {
      return dealer
        .set('make_id', make.get('id'))
        .save()
      ;
    })
  ;
};

Bootstrap.tables = function() {
  return Promise.all([
    manager.schema.createTable('cars', function(table) {
      table.increments('id');
      table.integer('color_id');
      table.integer('dealer_id');
      table.integer('model_id');
    }),

    manager.schema.createTable('colors', function(table) {
      table.increments('id');
      table.string('name');
      table.string('hex_value');
    }),

    manager.schema.createTable('dealers', function(table) {
      table.increments('id');
      table.integer('make_id');
      table.string('name');
      table.string('zip_code');
    }),

    manager.schema.createTable('dealers_models', function(table) {
      table.increments('id');
      table.integer('model_id');
      table.integer('dealer_id');
      table.boolean('available');
    }),

    manager.schema.createTable('makes', function(table) {
      table.increments('id');
      table.string('name');
    }),

    manager.schema.createTable('models', function(table) {
      table.increments('id');
      table.integer('make_id');
      table.integer('type_id');
      table.string('name');
      table.decimal('base_price');
    }),

    manager.schema.createTable('models_specs', function(table) {
      table.increments('id');
      table.integer('model_id');
      table.integer('spec_id');
    }),

    manager.schema.createTable('specs', function(table) {
      table.increments('id');
      table.string('name');
    }),

    manager.schema.createTable('types', function(table) {
      table.increments('id');
      table.string('name');
    }),
  ]);
};

module.exports = Bootstrap;
