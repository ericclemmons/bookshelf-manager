var assert = require('assert');
var Bootstrap = require('./support/bootstrap');
var Manager = require('../lib/manager');

describe('manager', function() {

  var manager;
  var Model;

  beforeEach(function() {
    manager = new Manager(Bootstrap.database());

    Model = function(Bookshelf) {
      return Bookshelf.Model.extend({
        table: 'fake'
      });
    };
  });

  describe('.register', function() {
    it('should return a function', function() {
      assert.equal(typeof manager.register(Model, 'fake'), 'function');
    });

    it('must be called with both a Model and a model name', function() {
      assert.throws(function() {
        return manager.register();
      }, /Manager.register must be called with a model and a model name/);

      assert.throws(function() {
        return manager.register(Model);
      }, /Manager.register must be called with a model and a model name/);

      assert.throws(function() {
        return manager.register('fake');
      }, /Manager.register must be called with a model and a model name/);
    });

    it('should register the model in the Bookshelf registry', function() {
      manager.register(Model, 'fake');
      assert.ok(manager.bookshelf.model('fake').prototype instanceof manager.bookshelf.Model);
    });

    it('should not allow re-registering the same model name', function() {
      manager.register(Model, 'fake');
      assert.throws(function() {
        return manager.register(Model, 'fake');
      }, /fake is already defined in the registry/);
    });

  });
});
