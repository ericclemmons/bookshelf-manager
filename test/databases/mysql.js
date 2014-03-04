var Bookshelf = require('bookshelf');

var MySql = Bookshelf.initialize({
  client:      'mysql',
  connection:  {
    user:      'root',
  }
});

module.exports = MySql;
