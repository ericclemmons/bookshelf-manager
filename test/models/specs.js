var Specs = function(Bookshelf) {
  return Bookshelf.Collection.extend({
    model: 'spec'
  });
};

module.exports = Specs;
