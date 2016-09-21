var Title = function(Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'titles',

    car: function() {
      return this.belongsTo('car');
    }
  });
};

module.exports = Title;
