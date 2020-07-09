#!/usr/bin/env node
// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
const path = require('path')
const repolinter = require('..')
const rimraf = require('rimraf')
const git = require('simple-git/promise')()
/** @type {any} */
const fetch = require('node-fetch')
const fs = require('fs')
const os = require('os')

require('yargs')
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
      .option('ruleset-file', {
        alias: 'r',
        describe: 'Specify an alternate location for the repolinter.json configuration to use (This will default to repolinter.json at the root of the project, or the internal default ruleset if none is found).',
        type: 'string'
      })
      .option('ruleset-url', {
        alias: 'u',
        describe: 'Specify an alternate URL repolinter.json configuration to use (This will default to repolinter.json at the root of the project, or the internal default ruleset if none is found).',
        type: 'string'
      })
      .option('git', {
        alias: 'g',
        describe: 'Lint a git repository instead of a directory. The URL specified in the directory parameter will be cloned into a temporary directory in order for repolinter to process it.',
        default: false,
        type: 'boolean'
      })
  }, async (/** @type {any} */ argv) => {
    let rulesetParsed = null
    // resolve the ruleset if a url is specified
    if (argv['ruleset-url']) {
      const res = await fetch(argv['ruleset-url'])
      if (!res.ok) {
        console.error(`Failed to fetch config from ${argv['ruleset-url']} with status code ${res.status}`)
        process.exitCode = 1
        return
      }
      rulesetParsed = await res.json()
    }
    let tmpDir = null
    // temporarily clone a git repo to lint
    if (argv.git) {
      tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'repolinter-'))
      const result = await git.clone(argv.directory, tmpDir)
      if (result) {
        console.error(result)
        process.exitCode = 1
        rimraf(tmpDir, function () {})
        return
      }
    }
    // run the linter
    const output = await repolinter.lint(tmpDir || path.resolve(process.cwd(), argv.directory), argv.allowPaths, argv.dryRun, rulesetParsed || argv['ruleset-file'])
    console.log(repolinter.defaultFormatter.formatOutput(output, argv.dryRun))
    process.exitCode = output.passed ? 0 : 1
    // delete the tmpdir if it exists
    if (tmpDir) { rimraf(tmpDir, function () {}) }
  })
  .demandCommand()
  .help()
  .strict()
  .argv
