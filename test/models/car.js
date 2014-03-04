var Test = require('../databases/test');

var Car = Test.Model.extend({
  tableName: 'cars',

  specs: function() {
    return this.belongsToMany('spec', 'cars_specs', 'car_id', 'spec_id');
  },

  type: function() {
    return this.belongsTo('type');
  }
});

module.exports = Car;
