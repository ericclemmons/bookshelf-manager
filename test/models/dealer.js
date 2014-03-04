var Test = require('../databases/test');

var Dealer = Test.Model.extend({
  tableName: 'dealers',

  brand: function() {
    return this.belongsTo('brand');
  },

  cars: function() {
    return this.hasMany('dealer.car');
  }
});

module.exports = Dealer;
