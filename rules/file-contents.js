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
  const defaultBranch = (await simpleGit().branchLocal()).current

  let results = []
  let noMatchingFileFoundCount = 0
  let switchedBranch = false
  for (let index = 0; index < branches.length; index++) {
    const branch = branches[index]
    // if branch name is 'default', ignore and do not checkout.
    // 'default' keyword is reserved for default branch when cloning
    if (branch !== 'default') {
      // perform git checkout of the target branch
      const checkoutResult = await gitCheckout(branch)
      if (checkoutResult) {
        console.error(`Failed checking out branch: ${branch}`)
        console.error(checkoutResult)
        process.exitCode = 1
        return
      }
      switchedBranch = true
    }

    const files = await fs.findAllFiles(fileList, !!options.nocase)
    if (files.length === 0) {
      noMatchingFileFoundCount++
      continue
    }

    const ruleOutcomeArray = await Promise.all(
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
    results = results.concat(ruleOutcomeArray)
  }
  if (noMatchingFileFoundCount > 0) {
    return new Result(
      'Did not find file matching the specified patterns',
      fileList.map(f => {
        return { passed: false, pattern: f }
      }),
      !options['fail-on-non-existent']
    )
  }
  if (switchedBranch) {
    // Make sure we are back using the default branch
    const checkoutResult = await gitCheckout(defaultBranch)
    if (checkoutResult) {
      console.error(`Failed checking out the default branch: ${defaultBranch}`)
      console.error(checkoutResult)
      process.exitCode = 1
      return
    }
  }

  const filteredRuleOutcomes = results.filter(r => r !== null)
  const passed = any
    ? filteredRuleOutcomes.some(r => r.passed)
    : !filteredRuleOutcomes.find(r => !r.passed)

  return new Result('', filteredRuleOutcomes, passed)
}

// Helper method to quickly checkout to a different branch
async function gitCheckout(branch) {
  return await simpleGit({
    progress({ method, stage, progress }) {
      console.log(`git.${method} ${stage} stage ${progress}% complete`)
    }
  }).checkout(branch)
}

module.exports = fileContents
