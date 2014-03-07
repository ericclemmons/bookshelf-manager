var MySql = require('../databases/mysql');

module.exports = function() {
  return MySql.knex.raw('DROP DATABASE IF EXISTS bookshelf_manager_test')
    .then(function() {
      return MySql.knex.raw('CREATE DATABASE bookshelf_manager_test')
    })
  ;
};
