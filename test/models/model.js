var Test = require('../databases/test');

var Model = Test.Model.extend({
  tableName: 'models',

  specs: function() {
    return this.belongsToMany('spec', 'models_specs', 'model_id', 'spec_id');
  },

  type: function() {
    return this.belongsTo('type');
  }
});

module.exports = Model;
