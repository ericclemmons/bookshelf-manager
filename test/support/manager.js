var path    = require('path');

var Manager = require('../../lib/manager');
var Test    = require('../databases/test');

module.exports = new Manager(path.join(__dirname, '..', 'models'), Test);
