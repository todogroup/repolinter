// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const licensee = require('../lib/licensee')
const Result = require('../lib/result')

module.exports = async function (fileSystem) {
  let licenses = []
  try {
    licenses = await licensee.identifyLicense(fileSystem.targetDir)
  } catch (error) {
    return new Result(error.message, [], false)
  }
  return new Result(
    '',
    licenses.map(l => {
      return { passed: true, path: l }
    }),
    true
  )
}
