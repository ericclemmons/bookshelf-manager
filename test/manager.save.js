var assert  = require('assert');
var deep    = require('deep-diff');

var Bootstrap = require('./support/bootstrap');

describe('manager', function() {
  describe('.save', function() {
    var manager;

    beforeEach(function() {
      manager = Bootstrap.manager(Bootstrap.database());
      Bootstrap.models(manager);
      return Bootstrap.tables(manager)
      .then(function() {
        return Bootstrap.fixtures(manager);
      });
    });

    it('should return a promise', function() {
      var car     = manager.forge('car');
      var promise = manager.save(car);

      assert.ok(promise.then instanceof Function, 'Expected Function.  `then` is ' + typeof promise.then);
    });

    it('should save a new model', function() {
      var car = manager.forge('car');

      return manager.save(car).then(function(car) {
        assert.equal(car.id, 2, 'Car should have an ID of 2, not ' + car.id);
      });
    });

    it('should save an existing model with same ID', function() {
      var Make      = manager.get('make');
      var original  = new Make({
        name: 'Ford'
      });

      return manager.save(original).then(function() {
        return manager.save(new Make(), {
          id: original.id,
          name: 'Chevy'
        });
      }).then(function(make) {
        assert.equal(make.id, original.id, 'Should have overriden original model ID');
      }).then(function() {
        return manager.fetch('makes');
      }).then(function(makes) {
        assert.equal(makes.length, 2, 'Should only have 2 makes, not ' + makes.length);
      });
    });

    it('should modify the model', function() {
      return manager.fetch('car', { id: 1 }).then(function(car) {
        assert.equal(car.get('quantity'), 1, 'Car #1 should start with quantity of 1');

        return manager.save(car, {
          quantity: 2
        });
      }).then(function(car) {
        assert.equal(car.get('quantity'), 2, 'Car #1 should end with quantity of 2');
      });
    });

    it('should modify nested models', function() {
      return manager.fetch('car', { id: 1 }, ['color', 'title']).then(function(car) {
        assert.equal(car.related('color').id, 1);
        assert.equal(car.related('color').get('name'), 'Grey');
        assert.equal(car.related('title').id, 1);
        assert.equal(car.related('title').get('state'), 'TX');

        return manager.save(car, {
          color: {
            id: 1,
            name: 'Dark Grey'
          },
          title: {
            id: 1,
            state: 'FL',
            issue_date: '2017-01-01'
          }
        });
      }).then(function(car) {
        return car.fetch({
          withRelated: ['color', 'title']
        });
      }).then(function(car) {
        assert.equal(car.related('color').id, 1);
        assert.equal(car.related('color').get('name'), 'Dark Grey');
        assert.equal(car.related('title').id, 1);
        assert.equal(car.related('title').get('state'), 'FL');
        assert.equal(car.related('title').get('issue_date'), '2017-01-01');
      });
    });

    it('should modify a deep nested model', function() {
      return manager.fetch('car', { id: 1 }, 'model.type').then(function(car) {
        assert.equal(car.related('model').related('type').get('name'), 'Crossover');

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
          withRelated: 'model.type'
        });
      }).then(function(car) {
        assert.equal(car.related('model').related('type').get('name'), 'SUV');
      });
    });

    it('should ignore _pivot_ keys', function() {
      return manager.fetch('car', { id: 1 }, 'features').then(function(car) {
        var feature = car.related('features').at(0);
        var json    = feature.toJSON();

        json.name = 'GPSv2';

        return manager.save(feature, json);
      }).then(function(feature) {
        assert.equal(feature.get('name'), 'GPSv2');
      });
    });

    it('should orphan models in collection', function() {
      return manager.fetch('car', { id: 1 }, 'features').then(function(car) {
        assert.equal(car.related('features').length, 2, 'Car should have 2 existing features');

        return manager.save(car, {
          id: 1,
          features: []
        }).then(function(car) {
          assert.equal(car.related('features').length, 0, 'Car should have all features removed, found: ' + car.related('features').toJSON());
        });
      });
    });

    it('should support original fetched response', function() {
      var expected;

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
        ]).then(function(make) {
          expected = make.toJSON();

          return manager.save(make, expected);
        }).then(function(make) {
          var diffs = deep.diff(expected, make.toJSON()) || [];

          assert.equal(diffs.length, 0, diffs);

          return manager.knex('models_specs').select();
        }).then(function(results) {
          assert.equal(results.length, 2, 'Expected only 2 rows in `models_specs`, not ' + results.length);
        });
    });

    it('should support transactions', function() {
      return manager.bookshelf.transaction(function(t) {
        return manager.fetch('car', { id: 1 }, 'features', { transacting: t }).then(function(car) {
          return manager.save(car, {
            id: 1,
            quantity: 2,
            features: []
          }, {
            transacting: t
          }).then(function(car) {
            assert.equal(car.get('quantity'), 2, 'Car should have quantity 2, got: ' + car.get('quantity'));
            assert.equal(car.related('features').length, 0, 'Car should have all features removed, found: ' + car.related('features').toJSON());
            throw new Error('test');
          });
        });
      }).catch(function(err) {
        if (!(err instanceof assert.AssertionError)) {
          return manager.fetch('car', { id: 1 }, 'features').then(function(car) {
            assert.equal(car.get('quantity'), 1, 'Car should have quantity 1, got: ' + car.get('quantity'));
            assert.equal(car.related('features').length, 2, 'Car should have 2 existing features');
          });
        }
        throw err;
      });
    });

    it('should set belongsTo foreign keys to null if a related attribute is present but set to null', function() {

      return manager.fetch('model', { id: 1 }).then(function(model) {
        return manager.save(model, {
          name: 'X5',
          type: null
        }).then(function(model) {
          assert.equal(model.get('type_id'), null);
        });
      });
    });

    it('should save a new hasOne model and orphan any existing one if its id is unspecified', function() {
      return manager.fetch('car', { id: 1 }, 'title').then(function(car) {
        assert.equal(car.related('title').get('state'), 'TX');
        return manager.save(car, {
          title: {
            state: 'FL',
            issue_date: '2017-01-01'
          }
        });
      })
      .then(function() {
        return manager.fetch('car', { id: 1 }, 'title').then(function(car) {
          assert.equal(car.related('title').get('id'), 2);
          assert.equal(car.related('title').get('state'), 'FL');
          assert.equal(car.related('title').get('issue_date'), '2017-01-01');
        });
      })
      .then(function() {
        return manager.fetch('title', { id: 1 }).then(function(title) {
          assert.equal(title.get('car_id'), null);
          assert.equal(title.get('state'), 'TX');
          assert.equal(title.get('issue_date'), '2016-09-19');
        });
      });
    });
  });
});
