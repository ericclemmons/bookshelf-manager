module.exports = function(manager) {

  return manager.knex.transaction(async function(trx) {
    if (!(await trx.schema.hasTable('cars'))) {      
      await trx.schema.createTable('cars', function(table) {
        table.increments('id');
        table.integer('color_id');
        table.integer('dealer_id');
        table.integer('model_id');
        table.integer('quantity');
      });
    }
   
    if (!(await trx.schema.hasTable('cars_features'))) {
      await trx.schema.createTable('cars_features', function(table) {
        table.increments('id');
        table.integer('car_id');
        table.integer('feature_id');
      });
    }
   
    if (!(await trx.schema.hasTable('colors'))) {
      await trx.schema.createTable('colors', function(table) {
        table.increments('id');
        table.string('name');
        table.string('hex_value');
      });
    }
    
    
    if (!(await trx.schema.hasTable('dealers'))) {
      await trx.schema.createTable('dealers', function(table) {
        table.increments('id');
        table.integer('make_id');
        table.string('name');
        table.string('zip_code');
      });
    }
   
    if (!(await trx.schema.hasTable('features'))) {
      await trx.schema.createTable('features', function(table) {
        table.increments('id');
        table.string('name');
        table.decimal('cost');
      });
    }
   
    if (!(await trx.schema.hasTable('makes'))) {
      await trx.schema.createTable('makes', function(table) {
        table.increments('id');
        table.string('name');
      });
    }
   
    if (!(await trx.schema.hasTable('models'))) {
      await trx.schema.createTable('models', function(table) {
        table.increments('id');
        table.integer('make_id');
        table.integer('type_id');
        table.string('name');
        table.decimal('cost');
      });
    }
   
    if (!(await trx.schema.hasTable('models_specs'))) {
      await trx.schema.createTable('models_specs', function(table) {
        table.increments('id');
        table.integer('model_id');
        table.integer('spec_id');
      });
    }
    
    
    if (!(await trx.schema.hasTable('specs'))) {
      await trx.schema.createTable('specs', function(table) {
        table.increments('id');
        table.string('name');
      });
    }
   
    if (!(await trx.schema.hasTable('types'))) {
      await trx.schema.createTable('types', function(table) {
        table.increments('id');
        table.string('name');
      });
    }
    
    
    if (!(await trx.schema.hasTable('titles'))) {
      await trx.schema.createTable('titles', function(table) {
        table.increments('id');
        table.integer('car_id');
        table.text('state');
        table.text('issue_date');
      });
    }
    
  });
};
