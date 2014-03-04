var Test = require('../databases/test');

var Car = Test.Model.extend({
  tableName: 'cars',

  model: function() {
    return this.belongsTo('model');
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

module.exports = Car;
