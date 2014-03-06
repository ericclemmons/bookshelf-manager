var Test = require('../databases/test');

var Car = Test.Model.extend({
  tableName: 'cars',

  defaults: {
    quantity: 0,
  },

  color: function() {
    return this.belongsTo('color');
  },

  dealer: function() {
    return this.belongsTo('dealer');
  },

  model: function() {
    return this.belongsTo('model');
  },

  features: function() {
    return this.belongsToMany('feature');
  },
});

module.exports = Car;
