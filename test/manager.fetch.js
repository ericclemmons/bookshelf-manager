var assert = require('assert');

var Bootstrap = require('./support/Bootstrap');
var manager   = require('./support/manager');

describe('manager', function() {
  describe('.fetch', function() {
    Bootstrap.before(Bootstrap.database);
    Bootstrap.before(Bootstrap.tables);
    Bootstrap.before(Bootstrap.fixtures);

    it('should return a Model', function(done) {
      manager
        .fetch('make', {
          name: 'BMW'
        })
        .then(function(make) {
          assert.ok(make instanceof manager.bookshelf.Model);
          assert.equal('BMW', make.get('name'));
        })
        .then(done.bind(this, null), done)
      ;
    });

    it('should return a Collection', function(done) {
      manager
        .fetch('makes')
        .then(function(makes) {
          assert.ok(makes instanceof manager.bookshelf.Collection);
          assert.equal(1, makes.length);
          assert.equal('BMW', makes.get(1).get('name'));
        })
        .then(done.bind(this, null), done)
      ;
    });

    describe('related', function() {
      it('should return nested Models', function(done) {
        manager
          .fetch('make', { name: 'BMW' }, [
            'models',
            'models.specs',
            'models.type',
            'dealers',
          ]).then(function(make) {
            console.log(JSON.stringify(make.toJSON(), null, 2));
            done();
          })
        ;
      });
    });
  });
});
