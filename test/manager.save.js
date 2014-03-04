var assert = require('assert');

var Bootstrap = require('./support/bootstrap');
var manager   = require('./support/manager');

describe('manager', function() {
  describe('.save', function() {
    Bootstrap.before(Bootstrap.database);
    Bootstrap.before(Bootstrap.tables);

    describe('with a name', function() {
      it('should save a new model', function(done) {
        manager.save('brand', {
          name: 'BMW'
        }).then(function(model) {
          assert.equal(1, model.get('id'));
          assert.equal('BMW', model.get('name'));

          done();
        });
      });
    });

    describe('with a model', function() {
      it('should save new properties', function(done) {
        manager.fetch('brand', { name: 'BMW' });
        done();
      });
    });
  });
});
