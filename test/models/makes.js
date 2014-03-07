var Manager = require('../../lib/manager');

var Makes = Manager.manage(function(Bookshelf) {
  return Bookshelf.Collection.extend({
    model: 'make'
  });
});

module.exports = Makes;
