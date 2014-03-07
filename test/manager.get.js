var assert    = require('assert');
var path      = require('path');
var Promise   = require('bluebird');

var Bootstrap = require('./support/bootstrap');
var Manager   = require('../lib/manager');
var manager   = require('./support/manager');
var Test      = require('./databases/test');

Bootstrap.before(Bootstrap.database);

var ManagedModel = Manager.manage(function(Bookshelf) {
  return Bookshelf.Model.extend({
    table: 'managed_model'
  });
});

describe('manager', function() {
  describe('.get', function() {
    it('should register in cache', function() {
      assert.equal(manager.get('make'), manager._cache['make']);
      assert.equal(manager.get('makes'), manager._cache['makes']);
      assert.equal(manager.get('make'), Test.model('make'));
      assert.equal(manager.get('makes'), Test.collection('makes'));
    });

    describe('with a name', function() {
      it('should return a Model', function() {
        assert.ok(manager.get('make').prototype instanceof Test.Model);
      });

      it('should return a Collection', function() {
        assert.ok(manager.get('makes').prototype instanceof Test.Collection);
      });
    });

    describe('with a Model', function() {
      it('should return a Model', function() {
        var Model = Test.Model.extend({});

        assert.equal(Model, manager.get(Model));
      });

      it('should return a Collection', function() {
        var Collection = Test.Collection.extend();

        assert.equal(Collection, manager.get(Collection));
      });
    });

    describe('with a managed Model', function() {
      it('should return a Model for Bookshelf instance', function() {
        assert.ok(manager.get(ManagedModel).prototype instanceof Test.Model);
      });
    });
  });
});
