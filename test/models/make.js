var Test = require('../databases/test');

var Make = Test.Model.extend({
  tableName: 'makes',

  models: function() {
    return this.hasMany('model');
  },

  dealers: function() {
    return this.hasMany('dealer');
  },
});

module.exports = Make;
