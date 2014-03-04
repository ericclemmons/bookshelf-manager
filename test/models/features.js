var Test = require('../databases/test');

var Features = Test.Collection.extend({
  model: 'feature',
});

module.exports = Features;
