// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line no-unused-vars
const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')
const { default: simpleGit } = require('simple-git')

function getContent(options) {
  return options['human-readable-content'] !== undefined
    ? options['human-readable-content']
    : options.content
}

/**
 * Check if a list of files contains a regular expression.
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @param {boolean} not Whether or not to invert the result (not contents instead of contents)
 * @param {boolean} any Whether to check if the regular expression is contained by at least one of the files in the list
 * @returns {Promise<Result>} The lint rule result
 */
async function fileContents(fs, options, not = false, any = false) {
  // support legacy configuration keys
  const fileList = (any ? options.globsAny : options.globsAll) || options.files
  const branches = options.branches || ['default']
  const defaultBranch = await simpleGit().raw(['branch', '--show-current'])

  let results = []
  const fileFoundResults = []
  let switchedBranch = false
  branches.forEach(async b => {
    console.log(results)

    // if branch name is 'default', ignore and do not checkout.
    // 'default' keyword is reserved for default branch when cloning
    if (b !== 'default') {
      // perform git checkout of the target branch
      const result = await gitCheckout(b)
      if (result) {
        console.error(result)
        process.exitCode = 1
        return
      }
      switchedBranch = true
    }

    const files = await fs.findAllFiles(fileList, !!options.nocase)
    if (files.length === 0) {
      fileFoundResults.push(
        new Result(
          'Did not find file matching the specified patterns',
          fileList.map(f => {
            return { passed: false, pattern: f }
          }),
          !options['fail-on-non-existent']
        )
      )
      return
    }

    const tempResults = await Promise.all(
      files.map(async file => {
        const fileContents = await fs.getFileContents(file)
        if (!fileContents) return null

        const regexp = new RegExp(options.content, options.flags)
        const passed = fileContents.search(regexp) >= 0
        const message = `${
          passed ? 'Contains' : "Doesn't contain"
        } ${getContent(options)}`

        return {
          passed: not ? !passed : passed,
          path: file,
          message
        }
      })
    )
    results = results.concat(tempResults)
  })
  if (switchedBranch) {
    // Make sure we are back using the default branch
    const result = await gitCheckout(defaultBranch)
    if (result) {
      console.error(result)
      process.exitCode = 1
      return
    }
  }

  const filteredResults = results.filter(r => r !== null)
  const passed = any
    ? filteredResults.some(r => r.passed)
    : !filteredResults.find(r => !r.passed)

  return new Result('', filteredResults, passed)
}

// async function traverseFilesAndFindMatchingFileContents(
//   fs,
//   not,
//   files,
//   options
// ) {
//   return new Promise(resolve => {
//     files.map(async file => {
//       const fileContents = await fs.getFileContents(file)
//       if (!fileContents) return null

//       const regexp = new RegExp(options.content, options.flags)
//       const passed = fileContents.search(regexp) >= 0
//       const message = `${passed ? 'Contains' : "Doesn't contain"} ${getContent(
//         options
//       )}`

//       resolve({
//         passed: not ? !passed : passed,
//         path: file,
//         message
//       })
//     })
//   })
// }
// Helper method to quickly checkout to a different branch
async function gitCheckout(branch) {
  return await simpleGit({
    progress({ method, stage, progress }) {
      console.log(`git.${method} ${stage} stage ${progress}% complete`)
    }
  }).checkout(branch)
}

module.exports = fileContents
