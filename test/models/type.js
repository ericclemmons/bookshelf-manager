var Test = require('../databases/test');

var Type = Test.Model.extend({
  tableName: 'types',

  model: function() {
    return this.belongsTo('model');
  }
});

module.exports = Type;
