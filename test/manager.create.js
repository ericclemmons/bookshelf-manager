var assert    = require('assert');
var Promise   = require('bluebird');

var Bootstrap = require('./support/bootstrap');
var manager   = require('./support/manager');

describe('manager', function() {
  describe('.create', function() {
    Bootstrap.beforeEach(Bootstrap.database);
    Bootstrap.beforeEach(Bootstrap.tables);

    it('should create a new model', function(done) {
      manager.create('car').then(function(car) {
        assert.ok(manager.isModel(car), 'Car should be a Model');
        assert.ok(car.id, 'Car should have ID 1');
        done();
      });
    });

    it('should create a new collection', function(done) {
      manager.create('cars').then(function(cars) {
        assert.ok(manager.isCollection(cars), 'Car should be a Collection');
        done();
      });
    });

    it('should create a new, populated model', function(done) {
      manager.create('car', {
        quantity: 1
      }).then(function(car) {
        assert.equal(1, car.id, 'Car should have ID 1');
        assert.equal(1, car.get('quantity'), 'Car should have quantity of 1');
        done();
      });
    })

    it('should create a new, populated collection', function(done) {
      manager.create('cars', [
        { quantity: 1 },
        { quantity: 2 },
      ]).then(function(cars) {
        cars.sortBy('id');

        assert.equal(2, cars.length, 'Cars collection should have 2 Car models');
        assert.equal(1, cars.at(0).id, 'Car #1 should have ID 1, not ' + cars.at(0).id);
        assert.equal(2, cars.at(1).id, 'Car #2 should have ID 2, not ' + cars.at(1).id);
        done();
      });
    })

    it('should create a model within a new model (belongsTo)', function(done) {
      manager.create('car', {
        color: {
          name: 'White',
          hex_value: '#fff',
        },
        quantity: 1
      }).then(function(car) {
        assert.equal(1, car.id, 'Car should have ID 1');
        assert.equal(1, car.get('quantity'), 'Car should have quantity of 1');
        assert.equal(1, car.related('color').id, 'Color should have ID 1, not ' + car.related('color').id);
        assert.equal('White', car.related('color').get('name'), 'Color name should be White');
        assert.equal('#fff', car.related('color').get('hex_value'), 'Color hex_value should be #fff');
        done();
      })
    });

    it('should modify an existing nested model', function(done) {
      manager.create('color', {
        name: 'White',
        hex_value: '#fff',
      }).then(function(color) {
        manager.create('car', {
          color: {
            id: color.id,
            name: 'Grey',
            hex_value: '#666',
          },
          quantity: 2
        }).then(function(car) {
          assert.equal(color.id, car.related('color').id, 'Color ID should stay the same')
          assert.equal('Grey', car.related('color').get('name'), 'Color name should be Grey');
          assert.equal('#666', car.related('color').get('hex_value'), 'Color hex_value should be #666');
          done();
        });
      });
    });

    it('should create models within a nested collection (belongsToMany)', function(done) {
      manager.create('car', {
        features: [
          { name: 'ABS', cost: '1250' },
          { name: 'GPS', cost: '500' },
        ],
        quantity: 1
      }).then(function(car) {
        car.related('features').sortBy('name');

        assert.equal(1, car.id, 'Car should have ID 1');
        assert.equal(2, car.related('features').length, 'There should be 2 features');
        assert.ok(car.related('features').at(0).id, 'Feature #1 should have ID');
        assert.ok(car.related('features').at(1).id, 'Feature #2 should have ID');
        assert.equal('ABS', car.related('features').at(0).get('name'), 'Feature #1 name should be ABS');
        assert.equal('GPS', car.related('features').at(1).get('name'), 'Feature #2 name should be GPS');
        done();
      });
    });

    it('should create models within a nested collection (hasMany)', function(done) {
      manager.create('make', {
        models: [
          { name: 'X3' },
          { name: 'X5' },
        ]
      }).then(function(make) {
        make.related('models').sortBy('name');

        assert.equal(1, make.id, 'Make should have ID 1');
        assert.equal(2, make.related('models').length);
        assert.ok(make.related('models').at(0).id, 'Model #1 should have ID');
        assert.ok(make.related('models').at(1).id, 'Model #2 should have ID');
        assert.equal('X3', make.related('models').at(0).get('name'), 'Model #1 name should be X3, not ' + make.related('models').at(0).get('name'));
        assert.equal('X5', make.related('models').at(1).get('name'), 'Model #2 name should be X5, not ' + make.related('models').at(1).get('name'));
        done();
      });
    });

    it('should create a deep object', function(done) {
      manager.create('make', {
        name: 'BMW',
        models: [
          {
            name: 'X5',
            cost: 50000,
            type: {
              name: 'Crossover'
            },
            specs: [
              { name: '4 door' },
              { name: 'v6' },
            ]
          }
        ]
      }).then(function(result) {
        return manager.fetch('make', { name: 'BMW' }, ['models.type', 'models.specs']).then(function(actual) {
          assert.equal(
            actual.related('models').length,
            result.related('models').length
          );

          assert.equal(
            actual.related('models').at(0).related('specs').length,
            result.related('models').at(0).related('specs').length
          );

          assert.equal(
            JSON.stringify(actual.related('models').at(0).related('type').toJSON(), null, 2),
            JSON.stringify(result.related('models').at(0).related('type').toJSON(), null, 2)
          );

          done();
        });
      });
    });
  });
});
