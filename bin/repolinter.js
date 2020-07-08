#!/usr/bin/env node
// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** @type {any} */
const argv = require('yargs')
  .command('lint <directory>', 'run repolinter on the specified directory, outputting results to STDOUT.', yargs => {
    yargs
      .positional('directory', {
        describe: 'The target directory to lint',
        default: './',
        type: 'string'
      })
      .option('dryRun', {
        alias: 'd',
        describe: 'Prevents repolinter from making any modifications to disk, instead generating a report of suggested modifications.',
        default: false,
        type: 'boolean'
      })
      .option('allowPaths', {
        alias: 'a',
        describe: 'Limits repolinter to the specified list of directories (directories must still be contained in the target directory).',
        default: [],
        type: 'array'
      })
      .option('ruleset', {
        alias: 'r',
        describe: 'Specify an alternate location for the repolinter.json configuration to use (This will default to repolinter.json at the root of the project, or the internal default ruleset if none is found).',
        type: 'string'
      })
      .option('git', {
        alias: 'g',
        describe: 'Lint a git repository instead of a directory. The URL specified in the directory parameter will be cloned into a temporary directory in order for repolinter to process it.',
        default: false,
        type: 'boolean'
      })
  }).argv
const path = require('path')
const repolinter = require('..')

if (argv.git) {
  const git = require('simple-git')()
  const uuidv4 = require('uuid/v4')
  const rimraf = require('rimraf')
  const tmpDir = path.resolve(process.cwd(), 'tmp', uuidv4())

  git.clone(argv.directory, tmpDir, (error) => {
    if (!error) {
      const output = repolinter.lint(tmpDir, argv.allowPaths, argv.dryRun, argv.ruleset)
      console.log(repolinter.defaultFormatter.formatOutput(output, argv.dryRun))
    }
    rimraf(tmpDir, function () {})
  })
} else {
  const output = repolinter.lint(path.resolve(process.cwd(), argv.directory), argv.allowPaths, argv.dryRun, argv.ruleset)
  console.log(repolinter.defaultFormatter.formatOutput(output, argv.dryRun))
}