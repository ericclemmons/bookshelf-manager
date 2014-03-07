var Promise = require('bluebird');

var Bootstrap = {
  database:   require('./bootstrap.database'),
  fixtures:   require('./bootstrap.fixtures'),
  tables:     require('./bootstrap.tables'),
};

module.exports = Bootstrap;
