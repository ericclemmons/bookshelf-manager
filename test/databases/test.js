var Bookshelf = require('bookshelf');

var Test = Bookshelf.initialize({
  client:      'mysql',
  connection:  {
    user:      'root',
    database:  'bookshelf_manager_test',
  }
});

module.exports = Test;
