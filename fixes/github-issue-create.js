// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const { Octokit } = require('@octokit/rest')
let targetOrg = ''
let targetRepository = ''

/**
 * Create a Github Issue on the targeted repository specifically for this broken rule.
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @param {string[]} targets The files to modify (will be overridden by options if present)
 * @param {boolean} dryRun If true, repolinter will report suggested fixes, but will make no disk modifications.
 * @returns {Promise<Result>} The fix result
 */
async function createGithubIssue(fs, options, targets, dryRun = false) {
  try {
    await prepareWorkingEnvironment()
  } catch (error) {
    return new Result(error.message, [], false)
  }

  // Create Labels
  const labels = options.issueLabels
  labels.push(options.bypassLabel)
  await findOrAddGithubLabel(labels)
  options.issueLabels = options.issueLabels.filter(
    label => label !== options.bypassLabel
  )

  // Find issue created by Repolinter
  const issues = await findExistingRepolinterIssues(options)

  // If there are no issues, create one.
  // If there are issues, we loop through them and handle each each on it's own
  if (issues === null || issues === undefined) {
    // Issue should include the broken rule, a message in the body and a label.
    const createdIssue = await createIssueOnGithub(options)
    // We are done here, we created a new issue.
    return new Result(
      `No Open/Closed issues were found for this rule - Created new Github Issue with issue number - ${createdIssue.number}`,
      [],
      true
    )
  }

  const openIssues = issues.filter(issue => issue.state === 'open')
  for (let i = 0; i < openIssues.length; i++) {
    const issue = openIssues[i]
    // Issue is open, check body and find what rules have been broken.
    // If the rule that has been broken, is already listed in the issue body/title, do nothing
    const ruleIdentifier = retrieveRuleIdentifier(issue.body)
    if (ruleIdentifier === options.uniqueRuleId) {
      return new Result(
        `No Github Issue Created - Issue already exists with correct unique identifier`,
        [],
        true
      )
    }
  }

  const closedIssues = issues.filter(issue => issue.state === 'closed')
  for (let i = 0; i < closedIssues.length; i++) {
    const issue = closedIssues[i]
    const ruleIdentifier = retrieveRuleIdentifier(issue.body)

    if (ruleIdentifier === options.uniqueRuleId) {
      // This means that there is regression, we should update the issue with new body and comment on it.
      if (hasBypassLabelBeenApplied(options, issue.labels)) {
        // Bypass label has been seen for this issue, we can ignore it.
        return new Result(
          `Rule fix failed as Github Issue ${issue.number} has bypass label.`,
          [],
          true
        )
      } else {
        await updateIssueOnGithub(options, issue.number)
        await commentOnGithubIssue(options, issue.number)
        return new Result(
          `Github Issue ${issue.number} re-opened as there seems to be regression!`,
          [],
          true
        )
      }
    } else {
      console.error(
        'Issue: ' + issue.number + ' - No matching rule identifier was found'
      )
    }
  }
  // There are open/closed issues from Continuous Compliance, but non of them are for this ruleset
  // Issue should include the broken rule, a message in the body and a label.
  const newIssue = await createIssueOnGithub(options)
  return new Result(`Github Issue ${newIssue.number} Created!`, targets, true)
}

/**
 * Check if the bypass label has been found.
 *
 * @param {object} options The rule configuration.
 * @param {string[]} labels The labels of the issue to match against.
 * @returns {boolean} True if bypass label is found, false otherwise.
 */
function hasBypassLabelBeenApplied(options, labels) {
  for (let index = 0; index < labels.length; index++) {
    const label = labels[index]
    if (label.name === options.bypassLabel) {
      // Set bypass label to true as it has been seen for this issue
      return true
    }
  }
  return false
}

/**
 * Check if the unique rule id can be found in the issue body.
 *
 * @param {string} body The body of the issue.
 * @returns {string} Returns the rule identifier as a string that was found in the issue body.
 * @returns {null} Returns null if no rule identifier can be found in the issue body.
 */
function retrieveRuleIdentifier(body) {
  if (body.includes('Unique rule set ID: ')) {
    const ruleIdentifier = body.split('Unique rule set ID: ')[1]
    return ruleIdentifier
  } else {
    console.error('No rule identifier found, was the issue modified manually?')
    return null
  }
}

/**
 * Find existing repolinter issues, open and closed.
 * These issues are found by looking for labels and creator
 *
 * @param {object} options The rule configuration.
 * @returns {null} Returns null if no issue can be found.
 * @returns {object[]} Returns array of issues if issues can be found that match the criteria. This array is sorted by
 *  last created date. Latest created issues show up first.
 */
async function findExistingRepolinterIssues(options) {
  // Get issues by creator/labels
  const issues = await this.Octokit.request(
    'GET /repos/{owner}/{repo}/issues',
    {
      owner: targetOrg,
      repo: targetRepository,
      labels: options.issueLabels.join(),
      state: 'all',
      sort: 'created',
      direction: 'desc'
    }
  )

  // If there are no issues, return null
  if (issues.data.length === 0) {
    return null
  }

  const openIssues = issues.data.filter(({ state }) => state === 'open')
  if (openIssues.length > 1) {
    console.warn(
      `Found more than one matching open issue: ${openIssues
        .map(i => `#${i.number}`)
        .join(', ')}.`
    )
  }
  return issues.data
}

/**
 * Create an issue on Github with labels and all on the target repository.
 *
 * @param {object} options The rule configuration.
 * @returns {object} Returns issue after adding it via the Github API.
 */
async function createIssueOnGithub(options) {
  try {
    const issueBodyWithId = options.issueBody.concat(
      `\n Unique rule set ID: ${options.uniqueRuleId}`
    )
    return await this.Octokit.request('POST /repos/{owner}/{repo}/issues', {
      owner: targetOrg,
      repo: targetRepository,
      title: options.issueTitle,
      body: issueBodyWithId,
      labels: options.issueLabels
    })
  } catch (e) {
    console.error(e)
  }
}

/**
 * Update specific issue on Github.
 *
 * @param {object} options The rule configuration.
 * @param {string} issueNumber The number of the issue we should update.
 * @returns {object} Returns issue after updating it via the Github API.
 */
async function updateIssueOnGithub(options, issueNumber) {
  try {
    const issueBodyWithId = options.issueBody.concat(
      `\n Unique rule set ID: ${options.uniqueRuleId}`
    )
    return await this.Octokit.request(
      'PATCH /repos/{owner}/{repo}/issues/{issue_number}',
      {
        owner: targetOrg,
        repo: targetRepository,
        issue_number: issueNumber,
        title: options.issueTitle,
        body: issueBodyWithId,
        labels: options.issueLabels,
        state: 'open'
      }
    )
  } catch (e) {
    console.error(e)
  }
}

/**
 * Comment on a specific issue on Github.
 *
 * @param {object} options The rule configuration.
 * @param {string} issueNumber The number of the issue we should update.
 * @returns {object} Returns issue after commenting on it via the Github API.
 */
async function commentOnGithubIssue(options, issueNumber) {
  try {
    return await this.Octokit.request(
      'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
      {
        owner: targetOrg,
        repo: targetRepository,
        issue_number: issueNumber,
        body: options.commentBody
      }
    )
  } catch (e) {
    console.error(e)
  }
}

/**
 * Adds the labels to this target repository on Github.
 *
 * @param {string[]} labelsToCheckOrCreate An array of labels that we should check and possibly add.
 */
async function findOrAddGithubLabel(labelsToCheckOrCreate) {
  for (let i = 0; i < labelsToCheckOrCreate.length; i++) {
    try {
      await this.Octokit.request('GET /repos/{owner}/{repo}/labels/{name}', {
        owner: targetOrg,
        repo: targetRepository,
        name: labelsToCheckOrCreate[i]
      })
    } catch (error) {
      if (error.status === 404) {
        console.log(`Adding label: ${labelsToCheckOrCreate[i]}`)
        try {
          await this.Octokit.request('POST /repos/{owner}/{repo}/labels', {
            owner: targetOrg,
            repo: targetRepository,
            name: labelsToCheckOrCreate[i]
          })
        } catch (error) {
          if (error.status === 422) {
            // Do nothing, this means it's probably already being processed in another thread
          } else {
            console.log(error)
          }
        }
      }
    }
  }
}
/**
 * Prepare our working environment.
 * Check if environment variables are set.
 * Set constants like targetOrg and targetRepository and initialize OctoKit.
 *
 */
async function prepareWorkingEnvironment() {
  const targetRepoEnv = process.env.TARGET_REPO
  const authTokenEnv = process.env.GITHUB_TOKEN
  if (authTokenEnv === undefined || targetRepoEnv === undefined) {
    throw new Error(
      'Could not perform fix due to missing/invalid environment variables! Please set TARGET_REPO and GITHUB_TOKEN environment variables.'
    )
  }
  targetOrg = targetRepoEnv.split('/')[0]
  targetRepository = targetRepoEnv.split('/')[1]

  // Prepare
  this.Octokit = new Octokit({
    auth: authTokenEnv,
    baseUrl: 'https://api.github.com',
    owner: targetOrg,
    repo: targetRepository
  })
}

module.exports = createGithubIssue
