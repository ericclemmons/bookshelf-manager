var Test = require('../databases/test');

var Cars = Test.Collection.extend({
  model: 'Car'
});

module.exports = Cars;
