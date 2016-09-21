var assert    = require('assert');

var Bootstrap = require('./support/bootstrap');

describe('manager', function() {
  describe('.create', function() {
    var manager;

    beforeEach(function() {
      manager = Bootstrap.manager(Bootstrap.database());
      Bootstrap.models(manager);
      return Bootstrap.tables(manager);
    });

    it('should create a new model', function() {
      return manager.create('car').then(function(car) {
        assert.ok(manager.isModel(car), 'Car should be a Model');
        assert.ok(car.id, 'Car should have ID 1');
      });
    });

    it('should create a new collection', function() {
      return manager.create('cars').then(function(cars) {
        assert.ok(manager.isCollection(cars), 'Car should be a Collection');
      });
    });

    it('should create a new, populated model', function() {
      return manager.create('car', {
        quantity: 1
      }).then(function(car) {
        assert.equal(car.id, 1, 'Car should have ID 1');
        assert.equal(car.get('quantity'), 1, 'Car should have quantity of 1');
      });
    });

    it('should create a new, populated collection', function() {
      return manager.create('cars', [
        { quantity: 1 },
        { quantity: 2 }
      ]).then(function(cars) {
        cars.sortBy('quantity');

        assert.equal(cars.length, 2, 'Cars collection should have 2 Car models');
        assert.equal(cars.pluck('quantity').length, 2, 'Quantities should be set');
      });
    });

    it('should create a model within a new model (belongsTo)', function() {
      return manager.create('car', {
        color: {
          name: 'White',
          hex_value: '#fff'
        },
        quantity: 1
      }).then(function(car) {
        assert.equal(car.id, 1, 'Car should have ID 1, not ' + car.id);
        assert.equal(car.get('quantity'), 1, 'Car should have quantity of 1');
        assert.equal(car.related('color').id, 1, 'Color should have ID 1, not ' + car.related('color').id);
        assert.equal(car.related('color').get('name'), 'White', 'Color name should be White');
        assert.equal(car.related('color').get('hex_value'), '#fff', 'Color hex_value should be #fff');
      });
    });

    it('should create a model within a new model (hasOne)', function() {
      return manager.create('car', {
        title: {
          state: 'FL',
          issue_date: '2017-01-01'
        },
        quantity: 1
      }).then(function(car) {
        assert.equal(car.id, 1, 'Car should have ID 1, not ' + car.id);
        assert.equal(car.get('quantity'), 1, 'Car should have quantity of 1');
        assert.equal(car.related('title').id, 1, 'Title should have ID 1, not ' + car.related('title').id);
        assert.equal(car.related('title').get('state'), 'FL', 'Title state should be FL');
        assert.equal(car.related('title').get('issue_date'), '2017-01-01', 'Title issue_date should be 2017-01-01');
      });
    });

    it('should modify an existing nested model', function() {
      return manager.create('color', {
        name: 'White',
        hex_value: '#fff'
      }).then(function(color) {
        return manager.create('car', {
          color: {
            id: color.id,
            name: 'Grey',
            hex_value: '#666'
          },
          quantity: 2
        }).then(function(car) {
          assert.equal(car.related('color').id, color.id, 'Color ID should stay the same, not ' + car.related('color').id);
          assert.equal(car.related('color').get('name'), 'Grey', 'Color name should be Grey');
          assert.equal(car.related('color').get('hex_value'), '#666', 'Color hex_value should be #666');
        });
      });
    });

    it('should create models within a nested collection (belongsToMany)', function() {
      return manager.create('car', {
        features: [
          { name: 'ABS', cost: '1250' },
          { name: 'GPS', cost: '500' }
        ],
        quantity: 1
      }).then(function(car) {
        car.related('features').sortBy('name');

        assert.equal(car.id, 1, 'Car should have ID 1');
        assert.equal(car.related('features').length, 2, 'There should be 2 features');
        assert.equal(car.related('features').pluck('name').length, 2, 'There should be 2 names');
      });
    });

    it('should create models within a nested collection (hasMany)', function() {
      return manager.create('make', {
        models: [
          { name: 'X3' },
          { name: 'X5' }
        ]
      }).then(function(make) {
        make.related('models').sortBy('name');

        assert.equal(make.id, 1, 'Make should have ID 1');
        assert.equal(make.related('models').length, 2);
        assert.ok(make.related('models').at(0).id, 'Model #1 should have ID, not ' + make.related('models').at(0).id);
        assert.ok(make.related('models').at(1).id, 'Model #2 should have ID, not ' + make.related('models').at(1).id);
        assert.equal(make.related('models').at(0).get('name'), 'X3', 'Model #1 name should be X3, not ' + make.related('models').at(0).get('name'));
        assert.equal(make.related('models').at(1).get('name'), 'X5', 'Model #2 name should be X5, not ' + make.related('models').at(1).get('name'));
      });
    });

    it('should create a deep object', function() {
      return manager.create('make', {
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
              { name: 'v6' }
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
            actual.related('models').at(0).related('type').id,
            result.related('models').at(0).related('type').id
          );

          assert.equal(
            actual.related('models').at(0).related('type').name,
            result.related('models').at(0).related('type').name
          );
        });
      });
    });

    it('should set scalar attributes before saving new models', function() {
      var ValidatedModel = manager.get('model').extend({
        initialize: function() {
          this.on('saving', this.validateSave);
        },

        validateSave: function() {
          assert(typeof this.get('name') === 'string', 'Model name must be a string, not ' + typeof this.get('name'));
        }
      });

      return manager.create(ValidatedModel, { name: 'test' }).then(function(model) {
        assert.equal(model.get('name'), 'test', 'Model should have a name of `test`, not `' + model.get('name') + '`');
      });
    });

    describe('foreign key support', function() {

      it('should set foreign keys before saving child models', function() {
        var manager = Bootstrap.manager(Bootstrap.database());
        manager.register(require('./models/model')(manager.bookshelf).extend({
          initialize: function() {
            this.on('saving', this.validateSave);
          },

          validateSave: function() {
            assert.equal(typeof this.get('make_id'), 'number', 'Model make_id must be a number, not ' + typeof this.get('make_id'));
          }
        }), 'model');
        return Bootstrap.tables(manager).then(function() {
          return manager.create('make', {
            name: 'BMW',
            models: [
              { name: 'X3' },
              { name: 'X5' }
            ]
          });
        });
      });

      it('even when the foreign key is the same as the name of the relation', function() {
        var manager = Bootstrap.manager(Bootstrap.database());
        manager.register(manager.bookshelf.Model.extend({
          tableName: 'models',

          make_id: function() {
            return this.belongsTo('make');
          },

          initialize: function() {
            this.on('saving', this.validateSave);
          },

          validateSave: function() {
            assert.equal(typeof this.get('make_id'), 'number', 'Model make_id must be a number, not ' + typeof this.get('make_id'));
          }
        }), 'model');
        return Bootstrap.tables(manager).then(function() {
          return manager.create('make', {
            name: 'BMW',
            models: [
              { name: 'X3' },
              { name: 'X5' }
            ]
          });
        });
      });
    });

    it('should support transactions', function() {
      return manager.create('color', {
        name: 'White',
        hex_value: '#fff'
      }).then(function(color) {
        return manager.bookshelf.transaction(function(t) {
          return manager.create('car', {
            color: {
              id: color.id,
              name: 'Grey',
              hex_value: '#666'
            },
            quantity: 2
          }, {
            transacting: t
          }).then(function(car) {
            assert.equal(car.related('color').id, color.id, 'Color ID should stay the same, not ' + car.related('color').id);
            assert.equal(car.related('color').get('name'), 'Grey', 'Color name should be Grey');
            assert.equal(car.related('color').get('hex_value'), '#666', 'Color hex_value should be #666');
            throw new Error('test');
          });
        }).catch(function(err) {
          if (!(err instanceof assert.AssertionError)) {
            return manager.fetch('color', { id: color.id }).then(function(color) {
              assert.equal(color.get('name'), 'White', 'Color name should be White');
              assert.equal(color.get('hex_value'), '#fff', 'Color hex_value should be #fff');
            });
          }
          throw err;
        });
      });
    });

    it('should not create empty models when a related attribute is present but set to null', function() {
      var manager = Bootstrap.manager(Bootstrap.database());
      manager.register(require('./models/type')(manager.bookshelf).extend({
        initialize: function() {
          this.on('saving', this.validateSave);
        },

        validateSave: function() {
          throw new Error('should not save models for null attributes!');
        }
      }), 'type');
      return Bootstrap.tables(manager).then(function() {
        return manager.create('model', {
          name: 'X5',
          type: null
        });
      });
    });
  });
});
