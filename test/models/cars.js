var Manager = require('../../lib/manager');

var Cars = Manager.manage(function(Bookshelf) {
  return Bookshelf.Collection.extend({
    model: 'car',
  });
});

module.exports = Cars;
