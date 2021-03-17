// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const { Octokit } = require('@octokit/rest')

/**
 * Removes a file or a list of files.
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @param {string[]} targets The files to modify (will be overridden by options if present)
 * @param {boolean} dryRun If true, repolinter will report suggested fixes, but will make no disk modifications.
 * @returns {Promise<Result>} The fix result
 */
async function createGithubIssue(fs, options, targets, dryRun = false) {
  const octoKit = new Octokit({
    auth: 'a70e431a7bc22bf169f56cb7770c8b61ab4bac81',
    log: console,
    baseUrl: 'https://api.github.com'
  })
  console.error('Github Creation Debug: ' + options)
  try {
    await octoKit.issues.create({
      owner: 'Brend-Smits',
      repo: 'octokit-test-repo',
      title: 'test-issue'
    })
  } catch (e) {
    console.error(e)
  }
  // // create the issue on Github
  // if (!dryRun) {
  //   await Promise.all(targets.map(async t => fs.removeFile(t)))
  // }
  // create a result
  const removeTargets = targets.map(t => {
    return { passed: true, path: t, message: 'Github issue created' }
  })
  return new Result('', removeTargets, true)
}

module.exports = createGithubIssue
