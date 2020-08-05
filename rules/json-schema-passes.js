// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')
const Ajv = require('ajv')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')

/**
 * Check if a file matches a given JSON schema
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @returns {Promise<Result>} The lint rule result
 */
async function jsonSchemaPasses (fs, options) {
  const fileName = options.glob
  const file = await fs.findFirstFile(options.glob, options.nocase)

  if (file === undefined) {
    return new Result(
      'Did not find file matching the specified patterns',
      [{ passed: false, pattern: fileName }],
      !!options['succeed-on-non-existent'])
  }
  // get the file contents
  let fileContents = await fs.getFileContents(file)
  if (fileContents === undefined) {
    fileContents = ''
  }
  // parse them as JSON
  let parsed
  try {
    parsed = JSON.parse(fileContents)
  } catch (e) {
    return new Result('', [{ path: file, pattern: fileName, passed: false, message: `Failed to parse JSON with error ${e.toString()}` }], false)
  }
  // validate the JSON
  const validator = new Ajv().compile(options.schema)
  if (validator.errors) {
    throw new Error(`Failed to parse JSON schema with errors ${validator.errors.map(e => `root${e.dataPath} ${e.message}`).join(', ')}`)
  }
  const res = !!validator(parsed)
  let message
  if (options['human-readable-message']) {
    message = res ? `${options['human-readable-message']} found in file` : `${options['human-readable-message']} not found in file`
  } else {
    message = res ? 'JSON validation passed' : `JSON validation failed with errors: ${validator.errors.map(e => `root${e.dataPath} ${e.message}`).join(', ')}`
  }
  return new Result('', [{ path: file, pattern: fileName, passed: res, message }], res)
}

module.exports = jsonSchemaPasses
