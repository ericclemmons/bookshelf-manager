var Cars = function(Bookshelf) {
  return Bookshelf.Collection.extend({
    model: 'car'
  });
};

module.exports = Cars;
