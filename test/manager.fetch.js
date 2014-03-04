var assert = require('assert');

var Bootstrap = require('./support/Bootstrap');
var manager   = require('./support/manager');

describe('manager', function() {
  describe('.fetch', function() {
    Bootstrap.before(Bootstrap.database);
    Bootstrap.before(Bootstrap.tables);
    Bootstrap.before(Bootstrap.fixtures);

    it('should return a model', function(done) {
      manager
        .fetch('brand', {
          name: 'BMW'
        })
        .then(function(brand) {
          assert.ok(brand instanceof manager.bookshelf.Model);
          assert.equal('BMW', brand.get('name'));
        })
        .then(done.bind(this, null), done)
      ;
    });

    it('should return a collection', function(done) {
      manager
        .fetch('brands')
        .then(function(brands) {
          assert.ok(brands instanceof manager.bookshelf.Collection);
          assert.equal(1, brands.length);
          assert.equal('BMW', brands.get(1).get('name'));
        })
        .then(done.bind(this, null), done)
      ;
    });

    describe('related', function() {
      it('should return nested models', function(done) {
        manager
          .fetch('brand', { name: 'BMW' }, [
            'cars',
            'cars.specs',
            'cars.type',
            'dealers',
          ]).then(function(brand) {
            console.log(JSON.stringify(brand.toJSON(), null, 2));
            done();
          })
        ;
      });
    });
  });
});
