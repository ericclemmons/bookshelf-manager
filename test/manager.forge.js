var assert = require('assert');

var Bootstrap = require('./support/bootstrap');
var manager   = require('./support/manager');


describe('manager', function() {
  describe('.forge', function() {
    Bootstrap.before(Bootstrap.database);

    it('should create a new Model in memory', function() {
      var make = manager.forge('make', {
        name: 'Ford'
      });

      assert.ok(manager.isModel(make), 'Expected a Model');
      assert.equal(undefined, make.get('id'), 'ID should not be defined yet');
      assert.equal('Ford', make.get('name'), 'Name should be set');
    });
  });
});
