var assert    = require('assert');
var Manager   = require('../index.js');
var path      = require('path');
var Promise   = require('bluebird');
var Test      = require('./databases/test');
var Bootstrap = require('./support/bootstrap');
var manager   = new Manager(Test, path.join(__dirname, 'models'));

Bootstrap.before(Bootstrap.database);

describe('manager', function() {
  describe('.get', function() {
    it('should return a Model', function() {
      assert.ok(manager.get('car').prototype instanceof Test.Model);
    });

    it('should return a Collection', function() {
      assert.ok(manager.get('cars').prototype instanceof Test.Collection);
    });

    it('should register in registry', function() {
      assert.equal(manager.get('car'), Test.model('car'));
      assert.equal(manager.get('cars'), Test.collection('cars'));
    });
  });
});
