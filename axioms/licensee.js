// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const licensee = require('../lib/licensee')
const Result = require('../lib/result')

module.exports = function (fileSystem) {
  let licenses = []
  try {
    licenses = licensee.identifyLicensesSync(fileSystem.targetDir)
  } catch (error) {
    if (error.message === 'Licensee not installed') {
      return new Result('Licensee not found in path, only running license-independent rules', [], false)
    } else {
      return new Result(error.message, [], false)
    }
  }
  return new Result('', licenses.map(l => { return { passed: true, path: l } }), true)
}
