// Copyright 2018 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const Result = require('../lib/result')

module.exports = async function (fileSystem) {
  const packageManagerPatterns = {
    'pom.xml': 'maven',
    'project.xml': 'maven1',
    'package.json': 'npm',
    'setup.py': 'pypi',
    '*.nuspec': 'nuget',
    '*.podspec': 'cocoapod',
    'Cargo.toml': 'cargo',
    '*.gemspec': 'rubygem',
    DESCRIPTION: 'cran',
    'Makefile.PL': 'cpan',
    'Build.PL': 'cpan',
    'package.xml': 'pear',
    'ivy.xml': 'ivy',
    'build.gradle': 'gradle'
  }

  const packagers = (
    await Promise.all(
      Object.entries(packageManagerPatterns).map(async ([pattern, packager]) =>
        (await fileSystem.findFirst(pattern)) ? packager : null
      )
    )
  ).filter(p => p !== null)
  return new Result(
    '',
    packagers.map(p => {
      return { passed: true, path: p }
    }),
    true
  )
}
