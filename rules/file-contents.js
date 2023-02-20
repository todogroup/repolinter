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
 * @param {SimpleGit} git A simple-git object configured correct path
 * @returns {Promise<Result>} The lint rule result
 */
async function fileContents(fs, options, not = false, any = false, git) {
  // support legacy configuration keys
  const fileList = (any ? options.globsAny : options.globsAll) || options.files

  if (git === undefined) {
    git = simpleGit({
      progress({ method, stage, progress }) {
        console.log(`git.${method} ${stage} stage ${progress}% complete`)
      },
      baseDir: fs.targetDir
    })
  }

  const defaultBranch = (await git.branchLocal()).current
  const branches = options.branches || [defaultBranch]
  const defaultRemote = (await git.getRemotes())[0]
  await fetchAllBranchesRemote(git, defaultRemote.name)

  let results = []
  let noMatchingFileFoundCount = 0
  let switchedBranch = false
  for (let index = 0; index < branches.length; index++) {
    const branch = branches[index]
    if (
      !(await doesBranchExist(git, branch)) &&
      !(await doesBranchExist(git, `${defaultRemote.name}/${branch}`))
    ) {
      noMatchingFileFoundCount++
      continue
    }
    // if branch name is the default branch from clone, ignore and do not checkout.
    if (branch !== defaultBranch) {
      // perform git checkout of the target branch
      await gitCheckout(git, branch, defaultRemote.name)
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
  if (switchedBranch) {
    // Make sure we are back using the default branch
    await gitCheckout(git, defaultBranch, defaultRemote.name)
  }

  if (noMatchingFileFoundCount === branches.length) {
    return new Result(
      'Did not find file matching the specified patterns',
      fileList.map(f => {
        return { passed: false, pattern: f }
      }),
      !options['fail-on-non-existent']
    )
  }

  const filteredRuleOutcomes = results.filter(r => r !== null)
  const passed = any
    ? filteredRuleOutcomes.some(r => r.passed)
    : !filteredRuleOutcomes.find(r => !r.passed)

  return new Result('', filteredRuleOutcomes, passed)
}

// Fetch all remote branches, fetches just the names on remote.
// Needs to be done since we did a shallow checkout
async function fetchAllBranchesRemote(git, defaultRemote) {
  // Since we do a shallow clone, we need to first retrieve the branches
  await git.addConfig(
    `remote.${defaultRemote}.fetch`,
    `+refs/heads/*:refs/remotes/${defaultRemote}/*`
  )
  await git.remote(['update'])
}

// Check if branch exists
async function doesBranchExist(git, branch) {
  const branches = (await git.branch(['-r'])).all
  if (branches.find(v => v === branch)) {
    return true
  }
  return false
}
// Helper method to quickly checkout to a different branch
async function gitCheckout(git, branch, defaultRemote) {
  const checkoutResult = await git.checkout(branch)
  if (checkoutResult) {
    const checkoutResultWithDefaultOrigin = await git.checkout(
      `${defaultRemote}/${branch}`
    )
    if (checkoutResultWithDefaultOrigin) {
      console.error(checkoutResult)
      process.exitCode = 1
      throw new Error(`Failed checking out branch: ${defaultRemote}/${branch}`)
    }
  }
}

module.exports = fileContents
