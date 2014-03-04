var Test = require('../databases/test');

var Brands = Test.Collection.extend({
  model: 'brand'
});

module.exports = Brands;
