var Dealer = function(Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'dealers',

    make: function() {
      return this.belongsTo('make');
    },

    cars: function() {
      return this.hasMany('car', 'dealer_id');
    }
  });
};

module.exports = Dealer;
