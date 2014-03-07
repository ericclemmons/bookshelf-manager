var Manager = require('../../lib/manager');

var Type = Manager.manage(function(Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'types',

    model: function() {
      return this.belongsTo('model');
    }
  });
});

module.exports = Type;
