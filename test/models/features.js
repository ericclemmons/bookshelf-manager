var Features = function(Bookshelf) {
  return Bookshelf.Collection.extend({
    model: 'feature'
  });
};

module.exports = Features;
