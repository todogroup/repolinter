// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')

async function fileOrDirectoryExistence(fs, options) {
  const fileOrDirectoryExists = await fs.findFirst(
    options.globsAny,
    options.nocase
  )

  const passed = !!fileOrDirectoryExists

  return passed
    ? new Result(
        '',
        [
          {
            passed: true,
            path: fileOrDirectoryExists,
            message: 'Found file or directory matching the specified patterns'
          }
        ],
        true
      )
    : new Result(
        `${
          options['fail-message'] !== undefined
            ? options['fail-message'] + '. '
            : ''
        }Did not find a file or directory matching the specified patterns`,
        options.globsAny.map(f => {
          return { passed: false, pattern: f }
        }),
        false
      )
}

module.exports = fileOrDirectoryExistence
