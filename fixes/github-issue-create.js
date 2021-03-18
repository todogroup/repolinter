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
  this.Octokit = new Octokit({
    auth: 'PERSONAL ACCESS TOKEN (PAT) HERE',
    log: console,
    baseUrl: 'https://api.github.com',
    owner: 'Brend-Smits',
    repo: 'octokit-test-repo'
  })

  console.error('Github Creation Debug: ' + options)

  // Find issue created by Repolinter
  const issue = await findExistingRepolinterIssues()

  console.log(issue);
  if (issue === null || issue === undefined) {
  // Issue should include the broken rule, a message in the body and a label.
  const createdIssue = await createIssueOnGithub()

  } if(issue.state === 'closed') {
  // We should open a single issue per rule with the role that is broken in the title

    // Reopen issue, update title and comment on it to inform repo maintainers.
    // Issue body should have a body that includes what rules have failed.
  } else if (issue.state === 'open') {
    // Issue is open, check body and find what rules have been broken.
    // If the rule that has been broken, is already listed in the issue body/title, do nothing
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

async function findExistingRepolinterIssues() {
  const issues = await this.Octokit.issues.listForRepo({
    owner: 'Brend-Smits',
    repo: 'octokit-test-repo',
    labels: 'continuous-compliance',
    creator: 'Brend-Smits'
  })
  if (issues.data.length === 0) {
    return null;
  }

  const openIssues = issues.data.filter(({state}) => state === 'open')
  if (openIssues.length > 1)
  console.warn(
    `Found more than one matching open issue: ${openIssues
      .map(i => `#${i.number}`)
      .join(', ')}. Defaulting to the most recent.`
  )
  return issues.data[0]
}
// Create issue on Github
async function createIssueOnGithub() {
  try {
    return await this.Octokit.issues.create({
      owner: 'Brend-Smits',
      repo: 'octokit-test-repo',
      title: 'test-issue',
      body: 'Auto generated issue by Continuous Compliance',
      labels: ['continuous-compliance']
    })
  } catch (e) {
    console.error(e)
  }
}


module.exports = createGithubIssue
