// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const licensee = require('../lib/licensee')
const Result = require('../lib/result')

<<<<<<< HEAD
module.exports = async function (fileSystem) {
=======
module.exports = function (fileSystem) {
>>>>>>> upstream/master
  let licenses = []
  try {
    licenses = await licensee.identifyLicense(fileSystem.targetDir)
  } catch (error) {
<<<<<<< HEAD
    return new Result(error.message, [], false)
=======
    if (error.message === 'Licensee not installed') {
      return new Result('Licensee not found in path, only running license-independent rules', [], false)
    } else {
      return new Result(error.message, [], false)
    }
>>>>>>> upstream/master
  }
  return new Result('', licenses.map(l => { return { passed: true, path: l } }), true)
}
