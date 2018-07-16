// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const licensee = require('../lib/licensee')
module.exports = function (fileSystem) {
  let licenses = []
  try {
    licenses = licensee.identifyLicensesSync(fileSystem.targetDir)
  } catch (error) {
    if (error.message === 'Licensee not installed') {
      console.log(`Licensee Axiom: Licensee not found in path, only running license-independent rules`)
    } else {
      console.log(error)
    }
  }
  return licenses
}
