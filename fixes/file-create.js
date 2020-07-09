// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')
const FileSystem = require('../lib/file_system')
/** @type {any} */
const fetch = require('node-fetch')

/**
 * Create a new file, or replace a files contents
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @param {string[]} targets The files to modify (will be overridden by options if present)
 * @param {boolean} dryRun If true, repolinter will report suggested fixes, but will make no disk modifications.
 * @returns {Promise<Result>} The lint rule result
 */
async function fileCreate (fs, options, targets, dryRun = false) {
  // check if the file exists and error if necessary
  const exists = await fs.relativeFileExists(options.file)
  if (options.replace && exists) { return new Result('', [{ message: `${options.file} already exists (options.replace is set to false)`, passed: false, path: options.file }], false) }

  // read the text from the source, if necessary
  let content
  if (typeof options.text === 'string') { content = options.text } else if (typeof options.text === 'object') {
    if (options.text.url) {
      const req = await fetch(options.text.url)
      if (!req.ok) { return new Result(`Could not fetch from ${options.text.url}, received status code ${req.status}`, [], false) }
      content = await req.text()
    } else if (options.text.file) {
      const file = fs.findFirstFile([options.text.file], options.text.nocase === true)
      if (!file) { return new Result(`Could not find file matching pattern ${options.text.file} for file-create.`, [], false) }
      content = fs.getFileContents(file)
    }
  }
  if (!content) { return new Result('Text was not specified for file-create! Did you configure the ruleset correctly?', [], false) }

  // write it to the file
  if (!dryRun) { fs.setFileContents(options.file, content) }

  const message = typeof options.text === 'object'
    ? `${exists ? 'replace' : 'create'} file with text from ${options.text.file || options.text.url}`
    : `${exists ? 'replace' : 'create'} file with contents "${content}"`

  return new Result('', [{ message, passed: true, path: options.file }], true)
}

module.exports = fileCreate
