var Bootstrap = {
  before:     require('./bootstrap.before'),
  beforeEach: require('./bootstrap.beforeEach'),
  database:   require('./bootstrap.database'),
  fixtures:   require('./bootstrap.fixtures'),
  tables:     require('./bootstrap.tables'),
};

module.exports = Bootstrap;
