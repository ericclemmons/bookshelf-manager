var path = require('path');
var fs = require('fs');

module.exports = function(manager) {
  var sourceFolder = path.join(process.cwd(), '/test/models');
  var files = fs.readdirSync(sourceFolder);

  files.forEach(function(file) {
    var model = require(path.join(sourceFolder, file));
    var modelId = path.basename(file, path.extname(file));
    manager.register(model, modelId);
  });
};
