// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const linguist = require('../lib/linguist')
module.exports = function (targetDir) {
  let languages = []
  try {
    languages = linguist.identifyLanguagesSync(targetDir).map(language => language.toLowerCase())
  } catch (error) {
    console.log(`Linguist Axiom: Linguist not found in path, only running language-independent rules`)
  }
  return languages
}
