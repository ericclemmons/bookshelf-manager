var Test = require('../databases/test');

var Spec = Test.Model.extend({
  tableName: 'specs',

  model: function() {
    return this.belongsToMany('model');
  }
});

module.exports = Spec;
