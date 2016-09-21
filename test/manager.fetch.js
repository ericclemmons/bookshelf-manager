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
          assert.equal(make.get('name'), 'BMW');
        });
    });

    it('should return a Collection', function() {
      return manager
        .fetch('makes')
        .then(function(makes) {
          assert.ok(makes instanceof manager.bookshelf.Collection);
          assert.equal(makes.length, 1);
          assert.equal(makes.get(1).get('name'), 'BMW');
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
          'dealers.cars.title',
          'dealers.cars.color',
          'dealers.cars.model',
          'dealers.cars.features',
          'dealers.cars.model.type'
        ])
        .then(function(make) {
          var json = make.toJSON();

          assert.equal(json.name, 'BMW');
          assert.equal(json.models[0].name, 'X5');
          assert.equal(json.models[0].specs.length, 2);
          assert.equal(json.models[0].type.name, 'Crossover');
          assert.equal(json.dealers[0].name, 'Houston');
          assert.equal(json.dealers[0].cars[0].title.state, 'TX');
          assert.equal(json.dealers[0].cars[0].color.name, 'Grey');
          assert.equal(json.dealers[0].cars[0].model.name, 'X5');
          assert.equal(json.dealers[0].cars[0].features.length, 2);
        });
      });
    });
  });
});
