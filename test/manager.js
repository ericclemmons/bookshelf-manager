var assert    = require('assert');
var Bookshelf = require('bookshelf');
var path      = require('path');

var Manager = require('../lib/manager');
var Test    = require('./databases/test');

describe('Manager', function() {
  describe('when instantiated', function() {
    it('should require path as first argument', function() {
      assert.throws(function() {
        new Manager();
      }, 'Manager requires a path to model directory');
    });

    it('should accept a Bookshelf instance as second argument', function() {
      var manager = new Manager(path.join(__dirname, 'models'), Test);

      assert.equal(Test, manager.bookshelf);
    });

    it('should initialize after Bookshelf only once', function() {
      var manager = new Manager(path.join(__dirname, 'models'));

      assert.ok(manager.root);
      assert.ok(!manager.bookshelf);
      assert.ok(!manager.knex);
      assert.ok(!manager.schema);

      var first = Bookshelf.initialize({
        client:      'mysql',
        connection:  { user: 'root' }
      });

      assert.ok(manager.bookshelf);
      assert.ok(manager.knex);
      assert.ok(manager.schema);

      var second = Bookshelf.initialize({
        client:      'mysql',
        connection:  { user: 'root' }
      });

      assert.equal(first, manager.bookshelf);
    });
  });
});
