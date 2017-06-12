const fs = require('../lib/file_system');

module.exports = function(options, targetDir) {
  const fs2 = options.fs || new fs.FileSystem();
  const file = fs2.find_first(targetDir, options.files);
  if (file) {
    return {
      passes: [`${options.name} exists (${file})`]
    };
  } 

  return {
    failures: [`${options.name} doesn't exist`]
  };
};