var Test = require('../databases/test');

var Brand = Test.Model.extend({
  tableName: 'brands',

  cars: function() {
    return this.hasMany('car');
  },

  dealers: function() {
    return this.hasMany('dealer');
  },
});

module.exports = Brand;
