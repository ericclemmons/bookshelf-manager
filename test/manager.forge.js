var assert = require('assert');

var Bootstrap = require('./support/bootstrap');
var manager   = require('./support/manager');


describe('manager', function() {
  describe('.forge', function() {
    Bootstrap.before(Bootstrap.database);

    it('should create a new Model', function() {
      var make = manager.forge('make', {
        name: 'Ford'
      });

      assert.ok(make instanceof manager.bookshelf.Model);
      assert.equal(undefined, make.get('id'));
      assert.equal('Ford', make.get('name'));
    });
  });
});
