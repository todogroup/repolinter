// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')

module.exports = function (fileSystem, rule) {
  const options = rule.options
  const fs = options.fs || fileSystem
  const files = fs.findAllFiles(options.files, options.nocase === true)

  let filteredFiles = files
  if (options['skip-binary-files']) {
    filteredFiles = filteredFiles.filter(file => !fs.isBinaryFile(file))
  }

  if (options['skip-paths-matching']) {
    let regexes = []
    const extensions = options['skip-paths-matching']['extensions']
    if (extensions && extensions.length > 0) {
      const extJoined = extensions.join('|')
      // \.(svg|png|exe)$
      regexes.push(new RegExp('\.(' + extJoined + ')$', 'i')) // eslint-disable-line no-useless-escape
    }

    const patterns = options['skip-paths-matching']['patterns']
    if (patterns && patterns.length > 0) {
      const filteredPatterns = patterns
        .filter(p => typeof p === 'string' && p !== '')
        .map(p => new RegExp(p, options['skip-paths-matching']['flags']))
      regexes = regexes.concat(filteredPatterns)
    }
    filteredFiles = filteredFiles.filter(file =>
      !regexes.some(regex => file.match(regex))
    )
  }

  if (filteredFiles.length === 0 && options['succeed-on-non-existent']) {
    const message = `not found: (${options.files.join(', ')})`
    return [new Result(rule, message, null, true)]
  }

  let results = []
  filteredFiles.forEach(file => {
    const lines = fs.readLines(file, options.lineCount)
    const misses = options.patterns.filter((pattern) => {
      const regexp = new RegExp(pattern, options.flags)
      return !lines.match(regexp)
    })

    let message = `The first ${options.lineCount} lines of '${file}'`
    const passed = misses.length === 0
    if (passed) {
      message += ` contain all of the requested patterns.`
    } else {
      message += ` do not contain the patterns:\n\t${misses.join('\n\t')}`
    }

    results.push(new Result(rule, message, file, passed))
  })

  return results
}
