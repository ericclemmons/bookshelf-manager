var Bookshelf = require('bookshelf');
var Knex = require('knex');

module.exports = function() {
  return Bookshelf(Knex({
    client:      'sqlite3',
    connection:  {
      filename: ':memory:'
    }
  }));
};
