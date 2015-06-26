var assert    = require('assert');
var fs        = require('fs');

var Bootstrap = require('./support/bootstrap');
var Manager = require('../lib/manager');

describe('Manager', function() {
  describe('constructor', function() {
    it('should require a Bookshelf instance as the first argument', function() {
      assert.throws(function() {
        return new Manager();
      }, /Manager requires a Bookshelf instance/);

      assert.throws(function() {
        return new Manager({ invalid: 'object' });
      }, /Manager requires a Bookshelf instance/);

      assert.doesNotThrow(function() {
        return new Manager(Bootstrap.database());
      });
    });

    describe('if second options argument is specified', function() {

      it('should set the root model directory on the manager instance if provided on the options argument', function() {
        var manager = Bootstrap.manager(Bootstrap.database());
        assert(manager.root);
        assert(fs.lstatSync(manager.root).isDirectory());
      });
    });
  });
});
