var Manager = require('../../lib/manager');

var Car = Manager.manage(function(Bookshelf) {
  return Bookshelf.Model.extend({
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
});

module.exports = Car;
