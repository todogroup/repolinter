const fs = require('fs');
const path = require('path');

module.exports = function(options, targetDir) {
  var excludedFileTypes = [];
  fs.readdirSync(targetDir).forEach(file => {
  	if (path.extname(file) === options.type) {
  	  excludedFileTypes.push(file);
  	}
  });
  if (excludedFileTypes.length > 0) {
  	return {
      failures: [`File(s) of type ${options.type} exist: ${excludedFileTypes}`]
    };
  } else {
  	return {
  	  passes: [`File of type ${options.type} doesn't exist`]
    };
  }
};