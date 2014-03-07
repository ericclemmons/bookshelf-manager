var Manager = require('../../lib/manager');

var Color = Manager.manage(function(Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'colors',
  });
});

module.exports = Color;
