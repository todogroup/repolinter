#!/usr/bin/env node
// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const path = require('path')
const repolinter = require('..')

if (process.argv[2] === '--git') {
  const git = require('simple-git')()
  const uuidv4 = require('uuid/v4')
  const rimraf = require('rimraf')
  const tmpDir = path.resolve(process.cwd(), 'tmp', uuidv4())

  git.clone(process.argv[3], tmpDir)
  repolinter(tmpDir)
  rimraf(tmpDir, function () {})
} else {
  repolinter(path.resolve(process.cwd(), process.argv[2] || '.'))
}
