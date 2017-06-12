module.exports = class FileSystem {
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