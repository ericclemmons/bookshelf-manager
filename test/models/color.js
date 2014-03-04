var Test = require('../databases/test');

var Color = Test.Model.extend({
  tableName: 'colors',
});

module.exports = Color;
