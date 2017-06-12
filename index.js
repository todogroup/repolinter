const logSymbols = require('log-symbols');



const rulesToRun = [
  require('./rules/file_existence').bind(null, {name: 'License file', files: ['LICENSE*', 'COPYING*']}),
  require('./rules/file_existence').bind(null, {name: 'Readme file', files: ['README*']}),
  require('./rules/file_existence').bind(null, {name: 'Contributing file', files: ['CONTRIBUT*']}),
  require('./rules/file_contents').bind(null, {file: 'README.md', content: 'License'}),
  require('./rules/type_exclusion').bind(null, {type: '.dll'}),
]

const targetDir = process.argv[2];
rulesToRun.forEach(rule => {
  const result = rule(targetDir);
  renderResults(result.failures, false);
  renderResults(result.passes, true);
});

function renderResults(results, success) {
  if (results) {
    results.forEach(result => renderResult(result, success));
  }
}

function renderResult(message, success) {
  console.log(success ? logSymbols.success : logSymbols.error, message);
}