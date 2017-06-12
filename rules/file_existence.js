const fs = require('fs');
const path = require('path');

module.exports = function(options, targetDir) {
  if (fs.existsSync(path.join(targetDir, options.file))) {
    return {
      passes: [`File ${options.file} exists`]
    };
  } else {
    return {
      failures: [`File ${options.file} doesn't exist`]
    };
  }
};