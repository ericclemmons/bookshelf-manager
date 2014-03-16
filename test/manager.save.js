var assert  = require('assert');
var Promise = require('bluebird');

var Bootstrap = require('./support/bootstrap');
var manager   = require('./support/manager');

describe('manager', function() {
  describe('.save', function() {
    before(function(done) {
      Bootstrap.database().then(function() {
        return Bootstrap.tables();
      }).then(function() {
        return Bootstrap.fixtures();
      }).then(function() {
        done();
      });
    });

    it('should return a promise', function() {
      var car     = manager.forge('car');
      var promise = manager.save(car);

      assert.ok(promise.then instanceof Function, 'Expected Function.  `then` is ' + typeof promise.then);
    });

    it('should save a new model', function(done) {
      var car = manager.forge('car');

      manager.save(car).then(function(car) {
        assert.equal(3, car.id, 'Car should have an ID of 3, not ' + car.id);
        done();
      });
    });

    it('should save an existing model with same ID', function(done) {
      var Make      = manager.get('make');
      var original  = new Make({
        name: 'Ford',
      });

      manager.save(original).then(function() {
        return manager.save(new Make(), {
          id: original.id,
          name: 'Chevy',
        });
      }).then(function(make) {
        assert.equal(original.id, make.id, 'Should have overriden original model ID');
      }).then(function() {
        return manager.fetch('makes');
      }).then(function(makes) {
        assert.equal(2, makes.length, 'Should only have 2 makes, not ' + makes.length);
        done();
      });
    });

    it('should modify the model', function(done) {
      manager.fetch('car', { id: 1 }).then(function(car) {
        assert.equal(1, car.get('quantity'), 'Car #1 should start with quantity of 1');

        return manager.save(car, {
          quantity: 2,
        });
      }).then(function(car) {
        assert.equal(2, car.get('quantity'), 'Car #1 should end with quantity of 2');
        done();
      });
    });

    it('should modify a nested model', function(done) {
      manager.fetch('car', { id: 1 }, 'color').then(function(car) {
        assert.equal(1, car.related('color').id);
        assert.equal('Grey', car.related('color').get('name'));

        return manager.save(car, {
          color: {
            id: 1,
            name: 'Dark Grey',
          }
        });
      }).then(function(car) {
        return car.fetch({
          withRelated: 'color',
        });
      }).then(function(car) {
        assert.equal(1, car.related('color').id);
        assert.equal('Dark Grey', car.related('color').get('name'));
        done();
      });
    });

    it('should modify a deep nested model', function(done) {
      manager.fetch('car', { id: 1 }, 'model.type').then(function(car) {
        assert.equal('Crossover', car.related('model').related('type').get('name'));

        return manager.save(car, {
          model: {
            id: car.related('model').id,
            type: {
              id: car.related('model').related('type').id,
              name: 'SUV'
            }
          }
        });
      }).then(function(car) {
        return car.fetch({
          withRelated: 'model.type',
        });
      }).then(function(car) {
        assert.equal('SUV', car.related('model').related('type').get('name'));
        done();
      });
    });

    it('should ignore _pivot_ keys', function(done) {
      manager.fetch('car', { id: 1 }, 'features').then(function(car) {
        var feature = car.related('features').at(0);
        var json    = feature.toJSON();

        json.name = 'GPSv2';

        return manager.save(feature, json);
      }).then(function(feature) {
        assert.equal('GPSv2', feature.get('name'));
        done();
      });
    });

    it('should orphan models in collection', function(done) {
      manager.fetch('car', { id: 1 }, 'features').then(function(car) {
        assert.equal(2, car.related('features').length, 'Car should have 2 existing features');

        return manager.save(car, {
          id: 1,
          features: []
        }).then(function(car) {
          assert.equal(0, car.related('features').length, 'Car should have all features removed, found: ' + car.related('features').toJSON());
          done();
        });
      });
    });

    it('should support original fetched response', function(done) {
      var expected;

      manager
        .fetch('make', { name: 'BMW' }, [
          'models',
          'models.specs',
          'models.type',
          'dealers',
          'dealers.cars',
          'dealers.cars.color',
          'dealers.cars.model',
          'dealers.cars.features',
          'dealers.cars.model.type',
        ]).then(function(make) {
          expected = make.toJSON();

          return manager.save(make, expected);
        }).then(function(make) {
          assert.equal(JSON.stringify(expected), JSON.stringify(make.toJSON()));
          done();
        })
      ;
    })
  });
});
