const rulesToRun = [
  require('./rules/file_existence').bind(null, {name: 'License file', files: ['LICENSE*', 'COPYING*']}),
  require('./rules/file_existence').bind(null, {name: 'Readme file', files: ['README*']}),
  require('./rules/file_contents').bind(null, {file: 'README.md', content: 'License'}),
  require('./rules/file_type_exclusion').bind(null, {type: '.dll'}),
]

const targetDir = process.argv[2];
rulesToRun.forEach(rule => {
  const result = rule(targetDir);
  if (result.passes) {
    console.log(result.passes);
  } else if (result.failures) {
    console.error(result.failures);
  };
});
