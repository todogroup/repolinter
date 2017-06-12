const fs = require('fs');
const path = require('path');
const glob = require('glob');

module.exports = function(options, targetDir) {
  for (var i = 0; i < options.files.length; i++) {
    var files = glob.sync(path.join(targetDir, options.files[i]), {nocase: true});
    for (var j = 0; j < files.length; j++) {
      var file = files[j];
      if (fs.existsSync(file)) {
        return {
          passes: [`${options.name} exists (${file})`]
        };
      } 
    }
  }

  return {
    failures: [`${options.name} doesn't exist`]
  };
};