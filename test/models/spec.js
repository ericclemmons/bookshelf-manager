var Manager = require('../../lib/manager');

var Spec = Manager.manage(function(Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'specs',

    model: function() {
      return this.belongsToMany('model');
    }
  });
});

module.exports = Spec;
