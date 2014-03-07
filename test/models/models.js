var Manager = require('../../lib/manager');

var Test = Manager.manage(function(Bookshelf) {
  return Bookshelf.Collection.extend({
    model: 'model'
  });
});

module.exports = Models;
