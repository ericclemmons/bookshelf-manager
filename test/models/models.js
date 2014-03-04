var Test = require('../databases/test');

var Models = Test.Collection.extend({
  model: 'model'
});

module.exports = Models;
