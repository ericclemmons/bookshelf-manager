var path    = require('path');
var Manager = require('../../lib/manager');

module.exports = function(bookshelf) {
  return new Manager(bookshelf, {
    root: path.join(__dirname, '..', 'models')
  });
};
