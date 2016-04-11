var assert    = require('assert');

var Bootstrap = require('./support/bootstrap');
var Manager = require('../lib/manager');

describe('Manager', function() {
  describe('.plugin', function() {
    it('should instantiate and return a new Manager instance', function() {
      var bookshelf = Bootstrap.database();
      bookshelf.plugin(Manager.plugin);
      var manager = bookshelf.manager;
      assert.equal(manager.bookshelf, bookshelf);
    });
  });
});
