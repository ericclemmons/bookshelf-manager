var Test = require('../databases/test');

var Cars = Test.Collection.extend({
  model: 'car',
});

module.exports = Cars;
