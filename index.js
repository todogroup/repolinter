// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const logSymbols = require('log-symbols');
const linguist = require('./lib/linguist');

const rulesToRun = [
  require('./rules/file_existence').bind(null, {name: 'License file', files: ['LICENSE*', 'COPYING*']}),
  require('./rules/file_existence').bind(null, {name: 'Readme file', files: ['README*']}),
  require('./rules/file_existence').bind(null, {name: 'Contributing file', files: ['CONTRIBUT*']}),
  require('./rules/file_contents').bind(null, {file: 'README.md', content: 'License'}),
  require('./rules/file_type_exclusion').bind(null, {type: ['*.dll', '*.exe']}),
  require('./rules/licensee_check').bind(null, {name: 'Licensee Check'}),
  require('./rules/directory_existence').bind(null, {name: 'Test directory', directories: ['spec*', 'test*']}),
  require('./rules/file_starts_with').bind(null, {name: 'Source license headers', files: ['**/*.js'], ignore: 'node_modules/**', patterns: [/Copyright/i, /All rights reserved/i], line_count: 5})
]

const languageSpecificRules = {
  'Java' : [
    require('./rules/file_existence').bind(null, {name: 'Build file', files: ['pom.xml', 'build.xml']}),
  ],
  'JavaScript' : [
    require('./rules/file_existence').bind(null, {name: 'Build file', files: ['package.json']}),
  ]
}

const targetDir = process.argv[2];
rulesToRun.forEach(rule => {
  const result = rule(targetDir);
  renderResults(result.failures, false);
  renderResults(result.passes, true);
});

try {
  languages=linguist.identifyLanguagesSync(targetDir)

  for (var language in languages) {
    if(languageSpecificRules[language] != null) {

      languageSpecificRules[language].forEach(rule => {
        const result = rule(targetDir);
        renderResults(result.failures, false);
        renderResults(result.passes, true);
      });

    }
  }
} catch(e) {
  console.log("NOTE: Linguist not installed")
  // Linguist wasn't installed (one presumes)
}

function renderResults(results, success) {
  if (results) {
    results.forEach(result => renderResult(result, success));
  }
}

function renderResult(message, success) {
  console.log(success ? logSymbols.success : logSymbols.error, message);
}
