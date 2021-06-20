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

module.exports = {
  hasBypassLabelBeenApplied,
  retrieveRuleIdentifier
}
