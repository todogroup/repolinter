// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const chai = require('chai')
const expect = chai.expect

describe('rule', () => {
  describe('git_working_tree', function () {
    this.timeout(5000) // Calling external Git might take some time.

    const gitWorkingTree = require('../../rules/git-working-tree')

    it('passes if the specified directory is managed with Git', () => {
      const result = gitWorkingTree('.', {
        allowSubDir: false
      })

      expect(result).to.deep.equal({
        passes: ['The directory is managed with Git, and it is the root directory.']
      })
    })

    it('passes if the specified sub-directory is managed in Git and sub-directories are allowed', () => {
      const result = gitWorkingTree('tests', {
        allowSubDir: true
      })

      expect(result).to.deep.equal({
        passes: ['The sub-directory is managed with Git.']
      })
    })

    it('fails if the specified sub-directory is managed in Git but sub-directories are not allowed', () => {
      const result = gitWorkingTree('tests', {
        allowSubDir: false
      })

      expect(result).to.deep.equal({
        failures: ['The sub-directory is managed with Git, but need to check the root directory.']
      })
    })

    it('fails if the specified directory is not managed in Git', () => {
      const result = gitWorkingTree('/', {
        allowSubDir: false
      })

      expect(result).to.deep.equal({
        failures: ['The directory is not managed with Git.']
      })
    })
  })
})
