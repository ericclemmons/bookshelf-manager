var assert    = require('assert');
var Bookshelf = require('bookshelf');
var Manager   = require('../index.js');

var MySql = Bookshelf.initialize({
  client:   'mysql',
  connection: {
    user:     'root',
    database: 'bookshelf_manager_test'
  }
});

var Book = MySql.Model.extend({
  tableName: 'books'
});

describe('manager', function() {
  it('should Return true', function(done) {
    new Book({ title: 'Test Book' })
      .save()
      .then(done, done)
    ;
  });
});
