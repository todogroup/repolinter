const path = require('path');
const glob = require('glob');
const fs = require('fs');

class FileSystem {
  find_first(targetDir, globs) {
    for (var i = 0; i < globs.length; i++) {
      var files = glob.sync(path.join(targetDir, globs[i]), {nocase: true});
      for (var j = 0; j < files.length; j++) {
        var file = files[j];
        if (fs.existsSync(file)) {
          return file;
        } 
      }
    }
  }
}

module.exports = new FileSystem();