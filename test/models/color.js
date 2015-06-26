var Color = function(Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'colors'
  });
};

module.exports = Color;
