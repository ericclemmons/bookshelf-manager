var Bootstrap = {
  database:   require('./bootstrap.database'),
  manager:    require('./bootstrap.manager'),
  models:     require('./bootstrap.models'),
  fixtures:   require('./bootstrap.fixtures'),
  tables:     require('./bootstrap.tables')
};

module.exports = Bootstrap;
