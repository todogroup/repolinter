// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const linguist = require('../lib/linguist')
const Result = require('../lib/result')

module.exports = async function (fileSystem) {
  const languages = []
  try {
    var jsonObj = await linguist.identifyLanguages(fileSystem.targetDir)
    for (var language in jsonObj) {
      languages.push(language.toLowerCase())
    }
  } catch (error) {
    return new Result(error.message, [], false)
  }
  return new Result('', languages.map(l => { return { passed: true, path: l } }), true)
}
