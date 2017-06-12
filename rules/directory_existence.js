const file_existence = require('./file_existence');
module.exports = function(options, targetDir) {
  options.files = options.directories;
  return file_existence(options, targetDir);
}