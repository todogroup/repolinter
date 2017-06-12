
module.exports = function(options, targetDir) {
  const fs = options.fs || require('../lib/file_system');
  const files = fs.find_all(targetDir, options.files, options.ignore);
  const failures = [];
  files.forEach(file => {
    const lines = readLines(file, options.line_count);
    const all_match = options.patterns.every(pattern => {
      return lines.match(pattern);
    });
    if (!all_match) {
      failures.push(file + ' doesn\'t contain all the patterns');
    };
  });
  return {
    failures: failures
  };
}

function readLines(file, line_count) {
  return require('fs').readFileSync(file).toString().split(/\r?\n/g).slice(0, line_count).join('\n');
}