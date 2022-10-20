// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const spawnSync = require('child_process').spawnSync
const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')

/**
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @returns {Result} The lint rule result
 * @ignore
 */
function gitWorkingTree(fs, options) {
  const args = ['-C', fs.targetDir, 'rev-parse', '--show-prefix']
  const gitResult = spawnSync('git', args)
  const result = new Result('', [], true)
  if (gitResult.status === 0) {
    const prefix = gitResult.stdout.toString().trim()
    if (!prefix) {
      result.message =
        'The directory is managed with Git, and it is the root directory.'
      return result
    }

    if (options.allowSubDir) {
      result.message = 'The sub-directory is managed with Git.'
      return result
    } else {
      result.message =
        'The sub-directory is managed with Git, but need to check the root directory.'
      result.passed = false
      return result
    }
  } else {
    result.message = 'The directory is not managed with Git.'
    result.passed = false
    return result
  }
}

module.exports = gitWorkingTree
