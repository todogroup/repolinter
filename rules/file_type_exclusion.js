const fs = require('fs');
const path = require('path');

module.exports = function(options, targetDir) {
  const fs = options.fs || require('../lib/file_system');
  const files = fs.find_all(targetDir, options.type);
  if (files && files.length > 0) {
    return {
      failures: [`Excluded file type exists (${files})`]
    };
  }
  return {
    passes: [`Excluded file type doesn't exist (${options.type})`]
  };
};