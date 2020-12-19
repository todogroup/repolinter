// Copyright 2018 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const licensee = require('../lib/licensee')
const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')

/**
 * Check if the repository licence can be detected by the licensee tool
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @returns {Result} The lint rule result
 */
async function licenceDetect(fs) {
  const result = new Result('', [], false)

  let licenses = []
  try {
    licenses = await licensee.identifyLicense(fs.targetDir)
  } catch (error) {
    result.message = error.message
    return result
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

  return result
}

module.exports = licenceDetect
