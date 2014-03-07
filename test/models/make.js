var Manager = require('../../lib/manager');

var Make = Manager.manage(function(Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'makes',

    models: function() {
      return this.hasMany('model', 'make_id');
    },

    dealers: function() {
      return this.hasMany('dealer');
    },
  });
});

module.exports = Make;
