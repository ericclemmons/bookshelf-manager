var Test = require('../databases/test');

var Specs = Test.Collection.extend({
  model: 'spec'
});

module.exports = Specs;
