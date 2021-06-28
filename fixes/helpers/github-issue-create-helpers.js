/**
 * Check if the bypass label has been found.
 *
 * @param {object} options The rule configuration.
 * @param {string[]} labels The labels of the issue to match against.
 * @returns {boolean} True if bypass label is found, false otherwise.
 */
function hasBypassLabelBeenApplied(options, labels)
{
  for (let index = 0; index < labels.length; index++)
  {
    const label = labels[index]
    if (label.name === options.bypassLabel)
    {
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
function retrieveRuleIdentifier(body)
{
  if (body.includes('Unique rule set ID: '))
  {
    const ruleIdentifier = body.split('Unique rule set ID: ')[1]
    return ruleIdentifier
  } else
  {
    console.log('No rule identifier found, was the issue modified manually?')
    return null
  }
}

/**
 * Adds the labels to this target repository on Github.
 *
 * @param {string[]} labelsToCheckOrCreate An array of labels that we should check and possibly add.
 */
async function ensureAddedGithubLabels(labelsToCheckOrCreate, targetOrg, targetRepository, octoKit)
{
  for (let i = 0; i < labelsToCheckOrCreate.length; i++)
  {
    try
    {
      if (!await doesLabelExistOnRepo(targetOrg, targetRepository, labelsToCheckOrCreate[i], octoKit))
      {
        await octoKit.request('POST /repos/{owner}/{repo}/labels', {
          owner: targetOrg,
          repo: targetRepository,
          name: labelsToCheckOrCreate[i]
        })
      }
    } catch (error)
    {
      console.error(error)
    }
  }
}

/**
 * Checks if a label exists on a repository
 * Returns true if it exists, false otherwise.
 *
 * @param {string} targetOrg Organization/Owner of the repository.
 * @param {string} repo Name of the repository.
 * @param {string} label Label to check for.
 */
async function doesLabelExistOnRepo(targetOrg, repo, label, octokit)
{
  try
  {
    await octokit.request('GET /repos/{owner}/{repo}/labels/{name}', {
      owner: targetOrg,
      repo: repo,
      name: label
    })
  }
  catch (error)
  {
    if (error.status == 404)
    {
      return false
    } else
    {
      console.error(error)
    }
  }
  return true
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
async function findExistingRepolinterIssues(options, targetOrg, targetRepository, octokit)
{
  // Get issues by creator/labels
  let issues = []
  try
  {
    issues = await octokit.request(
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
  } catch (e)
  {
    console.error(e)
  }
  // If there are no issues, return null
  if (issues.data.length === 0)
  {
    return null
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

module.exports = {
  hasBypassLabelBeenApplied,
  retrieveRuleIdentifier,
  ensureAddedGithubLabels,
  findExistingRepolinterIssues
}
