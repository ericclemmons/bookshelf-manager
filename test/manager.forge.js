var assert = require('assert');

var Bootstrap = require('./support/bootstrap');
var manager   = require('./support/manager');


describe('manager', function() {
  describe('.forge', function() {
    Bootstrap.before(Bootstrap.database);

    it('should create a new model', function() {
      var brand = manager.forge('brand', {
        name: 'Ford'
      });

      assert.ok(brand instanceof manager.bookshelf.Model);
      assert.equal(undefined, brand.get('id'));
      assert.equal('Ford', brand.get('name'));
    });
  });
});
