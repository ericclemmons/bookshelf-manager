var Test = require('../databases/test');

var DealerCar = Test.Model.extend({
  tableName: 'dealer_car',

  car: function() {
    return this.belongsTo('car');
  },

  color: function() {
    return this.hasOne('color');
  },

  dealer: function() {
    return this.belongsTo('dealer');
  },

  features: function() {
    return this.hasMany('feature');
  }
});
