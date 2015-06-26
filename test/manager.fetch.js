var assert = require('assert');
var Bootstrap = require('./support/bootstrap');

describe('manager', function() {
  var manager;

  describe('.fetch', function() {
    before(function() {
      manager = Bootstrap.manager(Bootstrap.database());
      Bootstrap.models(manager);
      return Bootstrap.tables(manager)
      .then(function() {
        return Bootstrap.fixtures(manager);
      });
    });

    it('should return a Model', function() {
      return manager
        .fetch('make', {
          name: 'BMW'
        })
        .then(function(make) {
          assert.ok(make instanceof manager.bookshelf.Model);
          assert.equal('BMW', make.get('name'));
        });
    });

    it('should return a Collection', function() {
      return manager
        .fetch('makes')
        .then(function(makes) {
          assert.ok(makes instanceof manager.bookshelf.Collection);
          assert.equal(1, makes.length);
          assert.equal('BMW', makes.get(1).get('name'));
        });
    });

    describe('related', function() {
      it('should return nested Models', function() {
        return manager
        .fetch('make', { name: 'BMW' }, [
          'models',
          'models.specs',
          'models.type',
          'dealers',
          'dealers.cars',
          'dealers.cars.color',
          'dealers.cars.model',
          'dealers.cars.features',
          'dealers.cars.model.type'
        ])
        .then(function(make) {
          var json = make.toJSON();

          assert.equal('BMW',       json.name);
          assert.equal('X5',        json.models[0].name);
          assert.equal(2,           json.models[0].specs.length);
          assert.equal('Crossover', json.models[0].type.name);
          assert.equal('Houston',   json.dealers[0].name);
          assert.equal('Grey',      json.dealers[0].cars[0].color.name);
          assert.equal('X5',        json.dealers[0].cars[0].model.name);
          assert.equal(2,           json.dealers[0].cars[0].features.length);
        });
      });
    });
  });
});
