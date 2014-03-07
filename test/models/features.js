var Manager = require('../../lib/manager');

var Features = Manager.manage(function(Bookshelf) {
  return Bookshelf.Collection.extend({
    model: 'feature',
  });
});

module.exports = Features;
