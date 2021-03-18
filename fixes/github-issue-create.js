// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const { Octokit } = require('@octokit/rest');

/**
 * Removes a file or a list of files.
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @param {string[]} targets The files to modify (will be overridden by options if present)
 * @param {boolean} dryRun If true, repolinter will report suggested fixes, but will make no disk modifications.
 * @returns {Promise<Result>} The fix result
 */
async function createGithubIssue(fs, options, targets, dryRun = false)
{
  // Prepare
  this.Octokit = new Octokit({
    auth: '',
    baseUrl: 'https://api.github.com',
    owner: 'Brend-Smits',
    repo: 'octokit-test-repo'
  })

  // Create Labels
  await findOrAddGithubLabel(options.issueLabels.push(options.bypassLabel))
  options.issueLabels = options.issueLabels.filter(label => label !== options.bypassLabel)

  // Find issue created by Repolinter
  const issues = await findExistingRepolinterIssues(options)

  // If there are no issues, create one.
  // If there are issues, we loop through them and handle each each on it's own
  if (issues === null || issues === undefined)
  {
    // Issue should include the broken rule, a message in the body and a label.
    const createdIssue = await createIssueOnGithub(options)
    // We are done here, we created a new issue.
    return new Result(`No Open/Closed issues were found for this rule - Created new Github Issue with issue number - ${createdIssue.number}`, [], true)

  }

  const openIssues = issues.filter(issue => issue.state === 'open');
  for (let i = 0; i < openIssues.length; i++)
  {
    const issue = openIssues[i];
    // Issue is open, check body and find what rules have been broken.
    // If the rule that has been broken, is already listed in the issue body/title, do nothing
    const ruleIdentifier = retrieveRuleIdentifier(issue.body);
    if (ruleIdentifier === options.uniqueRuleId)
    {
      return new Result(`No Github Issue Created - Issue already exists with correct unique identifier`, [], true);
    }
  };

  const closedIssues = issues.filter(issue => issue.state === 'closed')
  for (let i = 0; i < closedIssues.length; i++)
  {
    const issue = closedIssues[i];
    const ruleIdentifier = retrieveRuleIdentifier(issue.body);

    if (ruleIdentifier === options.uniqueRuleId)
    {
      // This means that there is regression, we should update the issue with new body and comment on it.
      if (hasBypassLabelBeenApplied(options, issue.labels))
      {
        // Bypass label has been seen for this issue, we can ignore it.
        return new Result(`Rule fix failed as Github Issue ${issue.number} has bypass label.`, [], true);
      } else
      {
        await updateIssueOnGithub(options, issue.number)
        await commentOnGithubIssue(options, issue.number)
        return new Result(`Github Issue ${issue.number} re-opened as there seems to be regression!`, [], true);
      }
    } else
    {
      console.error('Issue: ' + issue.number + ' - No matching rule identifier was found')
    }
  }
  // There are open/closed issues from Continuous Compliance, but non of them are for this ruleset
  // Issue should include the broken rule, a message in the body and a label.
  const newIssue = await createIssueOnGithub(options)
  return new Result(`Github Issue ${newIssue.number} Created!`, targets, true)
}

// Check if the bypass label has been found
function hasBypassLabelBeenApplied(options, labels)
{
  for (let index = 0; index < labels.length; index++)
  {
    const label = labels[index];
    if (label.name === options.bypassLabel)
    {
      // Set bypass label to true as it has been seen for this issue
      return true;
    }
  }
  return false;
}

// Check if the unique rule id can be found in the issue body
function retrieveRuleIdentifier(body)
{
  if (body.includes("Unique rule set ID: "))
  {
    const ruleIdentifier = body.split("Unique rule set ID: ")[1];
    return ruleIdentifier
  } else
  {
    console.error("No rule identifier found, was the issue modified manually?");
    return null;
  }
}
// Find existing repolinter issues and return that array of issues
async function findExistingRepolinterIssues(options)
{
  const issues = await this.Octokit.issues.listForRepo({
    owner: 'Brend-Smits',
    repo: 'octokit-test-repo',
    labels: options.issueLabels.join(),
    creator: 'Brend-Smits',
    state: 'all',
    sort: 'created',
    direction: 'desc'
  })

  // If there are no issues, return null
  if (issues.data.length === 0)
  {
    return null;
  }

  const openIssues = issues.data.filter(({ state }) => state === 'open')
  if (openIssues.length > 1)
  {
    console.warn(
      `Found more than one matching open issue: ${openIssues
        .map(i => `#${i.number}`)
        .join(', ')}.`
    )
  }
  return issues.data
}

// Create issue on Github
async function createIssueOnGithub(options)
{
  try
  {
    const issueBodyWithId = options.issueBody.concat(`\n Unique rule set ID: ${options.uniqueRuleId}`)
    return await this.Octokit.issues.create({
      owner: 'Brend-Smits',
      repo: 'octokit-test-repo',
      title: options.issueTitle,
      body: issueBodyWithId,
      labels: options.issueLabels
    })
  } catch (e)
  {
    console.error(e)
  }
}

// Update issue on Github
async function updateIssueOnGithub(options, issueNumber)
{
  try
  {
    const issueBodyWithId = options.issueBody.concat(`\n Unique rule set ID: ${options.uniqueRuleId}`)
    return await this.Octokit.issues.update({
      owner: 'Brend-Smits',
      repo: 'octokit-test-repo',
      issue_number: issueNumber,
      title: options.issueTitle,
      body: issueBodyWithId,
      labels: options.issueLabels,
      state: 'open'
    })
  } catch (e)
  {
    console.error(e)
  }
}

// Comment on an issue on Github
async function commentOnGithubIssue(options, issueNumber)
{
  try
  {
    return await this.Octokit.issues.createComment({
      owner: 'Brend-Smits',
      repo: 'octokit-test-repo',
      issue_number: issueNumber,
      body: options.commentBody,
    })
  } catch (e)
  {
    console.error(e)
  }
}

async function findOrAddGithubLabel(labelsToCheckOrCreate)
{
  for (let i = 0; i < labelsToCheckOrCreate.length; i++)
  {
    label += labelsToCheckOrCreate[i];
    await this.Octokit.issues.createLabel({
      owner: 'Brend-Smits',
      repo: 'octokit-test-repo',
      name: label
    })
  }
  return;
}


module.exports = createGithubIssue
