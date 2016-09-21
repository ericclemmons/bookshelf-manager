var assert    = require('assert');
var path      = require('path');

var Manager = require('../lib/manager');
var Bootstrap = require('./support/bootstrap');

describe('manager', function() {
  describe('.get', function() {
    var manager, bookshelf;

    describe('if no root was specified', function() {
      before(function() {
        bookshelf = Bootstrap.database();
        manager = new Manager(bookshelf);
        Bootstrap.models(manager);
      });

      describe('with a name', function() {
        describe('if the model hasn\'t been registered yet', function() {
          it('should throw an error', function() {
            assert.throws(function() { manager.get('fake'); }, 'No model named `fake` has been registered and no model directory was specified');
          });
        });

        describe('if the model has been registered', function() {
          it('should return the Model', function() {
            assert.ok(manager.get('make').prototype instanceof bookshelf.Model);
          });
        });
      });

      describe('with a Model', function() {
        it('should return a Model', function() {
          var Model = bookshelf.Model.extend({});

          assert.equal(manager.get(Model), Model);
        });

        it('should return a Collection', function() {
          var Collection = bookshelf.Collection.extend();

          assert.equal(manager.get(Collection), Collection);
        });
      });
    });

    describe('if root was specified', function() {

      before(function() {
        bookshelf = Bootstrap.database();
        manager = Bootstrap.manager(bookshelf);
      });

      it('should throw an error if file not found', function() {
        assert.throws(function() { manager.get('fake'); }, /Could not find module/);
      });

      describe('with a name', function() {
        it('should return a Model', function() {
          assert.ok(manager.get('make').prototype instanceof bookshelf.Model);
        });

        it('should return a Collection', function() {
          assert.ok(manager.get('makes').prototype instanceof bookshelf.Collection);
        });

        it('should register the model in the registry', function() {
          assert.ok(bookshelf.model('make').prototype instanceof bookshelf.Model);
        });
      });

      describe('with a Model', function() {
        it('should return a Model', function() {
          var Model = bookshelf.Model.extend({});

          assert.equal(manager.get(Model), Model);
        });

        it('should return a Collection', function() {
          var Collection = bookshelf.Collection.extend();

          assert.equal(manager.get(Collection), Collection);
        });
      });
    });
  });
});
