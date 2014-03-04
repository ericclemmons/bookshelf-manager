var Promise = require('bluebird');
var manager = require('./manager');

module.exports = function() {
  return Promise.all([
    manager.schema.createTable('cars', function(table) {
      table.increments('id');
      table.integer('color_id');
      table.integer('dealer_id');
      table.integer('model_id');
      table.integer('quantity');
    }),

    manager.schema.createTable('cars_features', function(table) {
      table.increments('id');
      table.integer('car_id');
      table.integer('feature_id');
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

    manager.schema.createTable('features', function(table) {
      table.increments('id');
      table.string('name');
      table.decimal('cost');
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
      table.decimal('cost');
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
