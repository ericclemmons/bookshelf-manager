var Spec = function(Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'specs',

    model: function() {
      return this.belongsToMany('model');
    }
  });
};

module.exports = Spec;
