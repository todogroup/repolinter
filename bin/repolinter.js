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
const yaml = require('js-yaml')

// eslint-disable-next-line no-unused-expressions
require('yargs')
  .command(
    ['lint [directory]', '*'],
    'run repolinter on the specified directory, outputting results to STDOUT.',
    yargs => {
      yargs
        .positional('directory', {
          describe: 'The target directory to lint',
          default: './',
          type: 'string'
        })
        .option('dryRun', {
          alias: 'd',
          describe:
            'Prevents repolinter from making any modifications to disk, instead generating a report of suggested modifications.',
          default: false,
          type: 'boolean'
        })
        .option('allowPaths', {
          alias: 'a',
          describe:
            'Limits repolinter to the specified list of directories (directories must still be contained in the target directory).',
          default: [],
          type: 'array'
        })
        .option('rulesetFile', {
          alias: 'r',
          describe:
            'Specify an alternate location for the repolinter configuration to use (This will default to repolinter.json/repolinter.yaml at the root of the project, or the internal default ruleset if none is found).',
          type: 'string'
        })
        .option('rulesetUrl', {
          alias: 'u',
          describe:
            'Specify an alternate URL repolinter configuration to use (This will default to repolinter.json/repolinter.yaml at the root of the project, or the internal default ruleset if none is found).',
          type: 'string'
        })
        .option('git', {
          alias: 'g',
          describe:
            'Lint a git repository instead of a directory. The URL specified in the directory parameter will be cloned into a temporary directory in order for repolinter to process it.',
          default: false,
          type: 'boolean'
        })
        .option('format', {
          alias: 'f',
          describe:
            'Specify the formatter to use for the output ("json", "markdown", or "console")',
          default: 'console',
          type: 'string'
        })
    },
    async (/** @type {any} */ argv) => {
      let rulesetParsed = null
      let jsonerror
      let yamlerror
      // resolve the ruleset if a url is specified
      if (argv.rulesetUrl) {
        const res = await fetch(argv.rulesetUrl)
        if (!res.ok) {
          console.error(
            `Failed to fetch config from ${argv.rulesetUrl} with status code ${res.status}`
          )
          process.exitCode = 1
          return
        }
        const data = await res.text()
        // attempt to parse as JSON
        try {
          rulesetParsed = JSON.parse(data)
        } catch (e) {
          jsonerror = e
        }
        // attempt to parse as YAML
        if (!rulesetParsed) {
          try {
            rulesetParsed = yaml.safeLoad(data)
          } catch (e) {
            yamlerror = e
          }
        }
        // throw an error if neither worked
        if (!rulesetParsed) {
          console.log(`Failed to fetch ruleset from URL ${argv.rulesetUrl}:`)
          console.log(
            `\tJSON failed with error ${jsonerror && jsonerror.toString()}`
          )
          console.log(
            `\tYAML failed with error ${yamlerror && yamlerror.toString()}`
          )
          process.exitCode = 1
          return
        }
      }
      let tmpDir = null
      // temporarily clone a git repo to lint
      if (argv.git) {
        tmpDir = await fs.promises.mkdtemp(
          path.join(os.tmpdir(), 'repolinter-')
        )
        const result = await git.clone(argv.directory, tmpDir)
        if (result) {
          console.error(result)
          process.exitCode = 1
          rimraf(tmpDir, () => {})
          return
        }
      }
      // run the linter
      const output = await repolinter.lint(
        tmpDir || path.resolve(process.cwd(), argv.directory),
        argv.allowPaths,
        rulesetParsed || argv.rulesetFile,
        argv.dryRun
      )
      // create the output
      let formatter
      if (argv.format && argv.format.toLowerCase() === 'json') {
        formatter = repolinter.jsonFormatter
      } else if (argv.format && argv.format.toLowerCase() === 'markdown') {
        formatter = repolinter.markdownFormatter
      } else {
        formatter = repolinter.defaultFormatter
      }
      const formattedOutput = formatter.formatOutput(output, argv.dryRun)
      // log it!
      console.log(formattedOutput)
      process.exitCode = output.passed ? 0 : 1
      // delete the tmpdir if it exists
      if (tmpDir) {
        rimraf(tmpDir, function () {})
      }
    }
  )
  .demandCommand()
  .help()
  .strict().argv // eslint-disable-line
