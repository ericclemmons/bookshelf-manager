var assert    = require('assert');
var path      = require('path');
var Promise   = require('bluebird');

var Test      = require('./databases/test');
var Bootstrap = require('./support/bootstrap');
var manager   = require('./support/manager');

Bootstrap.before(Bootstrap.database);

describe('manager', function() {
  describe('.get', function() {
    it('should return a Model', function() {
      assert.ok(manager.get('make').prototype instanceof Test.Model);
    });

    it('should return a Collection', function() {
      assert.ok(manager.get('makes').prototype instanceof Test.Collection);
    });

    it('should register in cache', function() {
      assert.equal(manager.get('make'), manager.cache['make']);
      assert.equal(manager.get('makes'), manager.cache['makes']);
      assert.equal(manager.get('make'), Test.model('make'));
      assert.equal(manager.get('makes'), Test.collection('makes'));
    });
  });
});
