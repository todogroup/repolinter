// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const licensee = require('../lib/licensee')
module.exports = function (targetDir) {
  let licenses = []
  try {
    licenses = licensee.identifyLicensesSync(targetDir)
  } catch (error) {
    console.log(`Licensee Axiom: Licensee not found in path, only running license-independent rules`)
    console.log(error)
  }
  return licenses
}
