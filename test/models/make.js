var Make = function(Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'makes',

    models: function() {
      return this.hasMany('model', 'make_id');
    },

    dealers: function() {
      return this.hasMany('dealer', 'make_id');
    }
  });
};

module.exports = Make;
