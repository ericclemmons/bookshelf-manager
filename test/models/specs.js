var Manager = require('../../lib/manager');

var Specs = Manager.manage(function(Bookshelf) {
  return Bookshelf.Collection.extend({
    model: 'spec'
  });
});

module.exports = Specs;
