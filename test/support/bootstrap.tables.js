module.exports = function(manager) {

  return manager.knex.transaction(function(trx) {
    var schema = trx.schema;
    return schema.createTableIfNotExists('cars', function(table) {
      table.increments('id');
      table.integer('color_id');
      table.integer('dealer_id');
      table.integer('model_id');
      table.integer('quantity');
    })
    .then(function() {
      return schema.createTableIfNotExists('cars_features', function(table) {
        table.increments('id');
        table.integer('car_id');
        table.integer('feature_id');
      });
    })
    .then(function() {
      return schema.createTableIfNotExists('colors', function(table) {
        table.increments('id');
        table.string('name');
        table.string('hex_value');
      });
    })
    .then(function() {
      return schema.createTableIfNotExists('dealers', function(table) {
        table.increments('id');
        table.integer('make_id');
        table.string('name');
        table.string('zip_code');
      });
    })
    .then(function() {
      return schema.createTableIfNotExists('features', function(table) {
        table.increments('id');
        table.string('name');
        table.decimal('cost');
      });
    })
    .then(function() {
      return schema.createTableIfNotExists('makes', function(table) {
        table.increments('id');
        table.string('name');
      });
    })
    .then(function() {
      return schema.createTableIfNotExists('models', function(table) {
        table.increments('id');
        table.integer('make_id');
        table.integer('type_id');
        table.string('name');
        table.decimal('cost');
      });
    })
    .then(function() {
      return schema.createTableIfNotExists('models_specs', function(table) {
        table.increments('id');
        table.integer('model_id');
        table.integer('spec_id');
      });
    })
    .then(function() {
      return schema.createTableIfNotExists('specs', function(table) {
        table.increments('id');
        table.string('name');
      });
    })
    .then(function() {
      return schema.createTableIfNotExists('types', function(table) {
        table.increments('id');
        table.string('name');
      });
    });
  });
};
