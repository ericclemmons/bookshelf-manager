var Test = require('../databases/test');

var Spec = Test.Model.extend({
  tableName: 'specs',

  car: function() {
    return this.belongsToMany('car');
  }
});

module.exports = Spec;
