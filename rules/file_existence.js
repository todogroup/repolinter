module.exports = function(options, targetDir) {
  const fs = options.fs || require('../lib/file_system');
  const file = fs.find_first(targetDir, options.files);
  if (file) {
    return {
      passes: [`${options.name} exists (${file})`]
    };
  } 

  return {
    failures: [`${options.name} doesn't exist`]
  };
};