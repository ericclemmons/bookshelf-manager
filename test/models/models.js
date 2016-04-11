var Models = function(Bookshelf) {
  return Bookshelf.Collection.extend({
    model: 'model'
  });
};

module.exports = Models;
