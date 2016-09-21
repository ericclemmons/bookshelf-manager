var Car = function(Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'cars',

    defaults: {
      quantity: 0
    },

    title: function() {
      return this.hasOne('title', 'car_id');
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
    }
  });
};

module.exports = Car;
