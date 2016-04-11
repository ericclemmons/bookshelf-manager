var Makes = function(Bookshelf) {
  return Bookshelf.Collection.extend({
    model: 'make'
  });
};

module.exports = Makes;
