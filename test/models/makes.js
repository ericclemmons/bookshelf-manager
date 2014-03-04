var Test = require('../databases/test');

var Makes = Test.Collection.extend({
  model: 'make'
});

module.exports = Makes;
