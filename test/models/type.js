var Test = require('../databases/test');

var Type = Test.Model.extend({
  tableName: 'types',

  car: function() {
    return this.belongsTo('car');
  }
});

module.exports = Type;
