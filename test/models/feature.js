var Feature = function(Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'features',

    car: function() {
      return this.belongsToMany('car');
    }
  });
};

module.exports = Feature;
