var assert    = require('assert');
var Promise   = require('bluebird');

// var Bootstrap = require('./support/bootstrap');
var manager   = require('./support/manager');

describe('manager', function() {
  describe('.set', function() {
    it('should return a trusted promise', function() {
      var promise = manager.set(manager.create('make'), {
        name: 'BMW'
      });

      assert.ok(Promise.is(promise));
    });

    it('should set key/value pairs on a model', function(done) {
      manager.set(manager.create('make'), {
        name: 'BMW'
      }).then(function(make) {
        assert.equal('BMW', make.get('name'));
        done();
      });
    });

    it('should add models to a collection', function(done) {
      manager.set(manager.create('makes'), [
        manager.create('make'),
        manager.create('make'),
      ]).then(function(makes) {
        assert.equal(2, makes.length);
        assert.ok(makes.at(0) instanceof manager.bookshelf.Model);
        assert.ok(makes.at(1) instanceof manager.bookshelf.Model);
        done();
      });
    });
  });
});
