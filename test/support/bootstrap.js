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
  var brand   = manager.forge('brand',   { name: 'BMW' });
  var car     = manager.forge('car',     { name: 'X5', base_price: '50000.00' });
  var type    = manager.forge('type',    { name: 'Crossover' });
  var specs   = manager.forge('specs',   [ { name: '4 door'}, { name: 'v6' } ]);
  var color   = manager.forge('color',   { name: 'grey', hex_value: '#666' });
  var dealer  = manager.forge('dealer',  { name: 'Houston', zip_code: '77002' });

  return brand.save()
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
      car.set('brand_id', brand.get('id'));
      car.set('type_id', type.get('id'));

      return car.save();
    })
    .then(function() {
      car.specs().attach(specs.pluck('id'));
    })
    .then(function() {
      return dealer
        .set('brand_id', brand.get('id'))
        .save()
      ;
    })
  ;
};

Bootstrap.tables = function() {
  return Promise.all([
    manager.schema.createTable('brands', function(table) {
      table.increments('id');
      table.string('name');
    }),

    manager.schema.createTable('cars', function(table) {
      table.increments('id');
      table.string('name');
      table.decimal('base_price');
      table.integer('brand_id');
      table.integer('type_id');
    }),

    manager.schema.createTable('cars_dealers', function(table) {
      table.increments('id');
      table.boolean('available');
      table.integer('car_id');
      table.integer('dealer_id');
    }),

    manager.schema.createTable('cars_specs', function(table) {
      table.increments('id');
      table.integer('car_id');
      table.integer('spec_id');
    }),

    manager.schema.createTable('colors', function(table) {
      table.increments('id');
      table.string('name');
      table.string('hex_value');
    }),

    manager.schema.createTable('dealers', function(table) {
      table.increments('id');
      table.string('name');
      table.string('zip_code');
      table.integer('brand_id');
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
