var Test = require('../databases/test');

var Feature = Test.Model.extend({
  tableName: 'features',

  car: function() {
    return this.belongsToMany('dealer.car');
  }
});

module.exports = Feature;
