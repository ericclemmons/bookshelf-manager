var assert = require('assert');

var Manager = require('../lib/manager');

var ManagedModel = Manager.manage(function(Bookshelf) {
  return Bookshelf.Model.extend({
    table: 'fake'
  });
});

describe('Manager', function() {
  describe('.manage', function() {
    it('should return function', function() {
      assert.equal('function', typeof Manager.manage(ManagedModel));
    });
  });

  describe ('.manages', function() {
    it('should be managing a model', function() {
      assert.ok(Manager.manages(ManagedModel));
    });
  });
});
