// Copyright 2018 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

module.exports = function (fileSystem) {
  const packageManagers = []

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

  for (const [pattern, packager] of Object.entries(packageManagerPatterns)) {
    if (fileSystem.findFirst(pattern) != null) {
      packageManagers.push(packager)
    }
  }

  return packageManagers
}
