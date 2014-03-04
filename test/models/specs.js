var Test = require('../databases/test');

var Specs = Test.Collection.extend({
  model: 'Spec'
});

module.exports = Specs;
