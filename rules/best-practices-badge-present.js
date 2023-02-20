// Copyright 2022 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const fetch = require('node-fetch')
const Result = require('../lib/result')
const fileContents = require('./file-contents')
const bestPracticesRegExp =
  'https://bestpractices\\.coreinfrastructure\\.org(/\\w+)?/projects/\\d+'

module.exports = async function (fileSystem, options = {}, git) {
  const readmeContainsBadge = await fileContents(
    fileSystem,
    {
      globsAll: ['README*'],
      content: bestPracticesRegExp,
      nocase: true,
      flags: 'i',
      'fail-on-non-existent': true,
      'human-readable-content': 'Best Practices Badge'
    },
    undefined,
    undefined,
    git
  )
  if (!readmeContainsBadge.passed || !options.minPercentage) {
    return readmeContainsBadge
  }
  const readmePath = readmeContainsBadge.targets[0].path
  const targets = [{ path: readmePath }]
  const readmeContents = await fileSystem.getFileContents(readmePath)
  const bestPracticesUrl = readmeContents.match(
    new RegExp(bestPracticesRegExp, 'i')
  )[0]
  const bestPracticesResponse = await fetch(`${bestPracticesUrl}.json`)
  if (!bestPracticesResponse.ok) {
    return new Result('Invalid Best Practices Badge URL', targets, false)
  }
  const bestPracticesData = await bestPracticesResponse.json()
  const passed = bestPracticesData.tiered_percentage >= options.minPercentage
  const message = `Best Practices Badge ${
    passed ? 'reached' : 'did not reach'
  } minimum level`
  return new Result(message, targets, passed)
}
