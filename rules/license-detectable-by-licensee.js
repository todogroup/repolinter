// Copyright 2018 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const licensee = require('../lib/licensee')
const Result = require('../lib/result')

module.exports = function (fileSystem, rule) {
  let result = new Result(rule, '', null, false)

  let licenses = []
  try {
    licenses = licensee.identifyLicensesSync(fileSystem.targetDir)
  } catch (error) {
    result.message = error.message
    return [result]
  }

  result.passed = licenses.length > 0
  result.message = (() => {
    if (result.passed) {
      // License: Apache License 2.0
      const identified = licenses[0]
      return `Licensee identified the license for project: ${identified}`
    } else {
      return 'Licensee did not identify a license for project'
    }
  })()

  return [result]
}
