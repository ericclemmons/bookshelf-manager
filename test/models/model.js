var Manager = require('../../lib/manager');

var Model = Manager.manage(function(Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'models',

    make: function() {
      return this.belongsTo('make');
    },

    specs: function() {
      return this.belongsToMany('spec', 'models_specs', 'model_id', 'spec_id');
    },

    type: function() {
      return this.belongsTo('type');
    }
  });
});

module.exports = Model;
