var Type = function(Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'types',

    model: function() {
      return this.belongsTo('model');
    }
  });
};

module.exports = Type;
