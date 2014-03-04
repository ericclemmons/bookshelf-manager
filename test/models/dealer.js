var Test = require('../databases/test');

var Dealer = Test.Model.extend({
  tableName: 'dealers',

  make: function() {
    return this.belongsTo('make');
  },

  cars: function() {
    return this.hasMany('car');
  }
});

module.exports = Dealer;
