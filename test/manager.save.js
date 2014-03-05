var assert = require('assert');

var Bootstrap = require('./support/bootstrap');
var manager   = require('./support/manager');

describe('manager', function() {
  describe('.save', function() {
    Bootstrap.beforeEach(Bootstrap.database);
    Bootstrap.beforeEach(Bootstrap.tables);

    describe('with a name', function() {
      it('should create a new model', function(done) {
        manager.save('make', {
          name: 'BMW',
        }).then(function(make) {
          assert.equal(1,     make.get('id'));
          assert.equal('BMW', make.get('name'));
          done();
        });
      });
    });

    describe('with a Model', function() {
      it('should create the model with new properties', function(done) {
        manager.save('make', {
          name: 'BMW',
        }).then(function(make) {
          return manager.save(make, {
            name: 'Ford',
          });
        }).then(function(make) {
          assert.equal('Ford', make.get('name'));
          done();
        });
      });
    });

    describe('with a nested Model', function() {
      it('should create the nested model', function(done) {
        manager.save('car', {
          color: {
            name:       'White',
            hex_value:  '#fff',
          },
          quantity:     1,
        }).then(function(car) {
          console.log(car);
          done();
        });
      });
    });

    describe('with a nested Collection', function() {
      it('should save a new Collection', function(done) {
        manager.save('make', {
          name: 'BMW'
        })
      });
    });
  });
});
