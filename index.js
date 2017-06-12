const rulesToRun = [
  require('./rules/file_existence').bind(null, {name: 'License file', files: ['LICENSE.md', 'LICENSE']}),
  require('./rules/file_existence').bind(null, {name: 'Readme file', files: ['README.md']})
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