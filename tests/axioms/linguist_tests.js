// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const commandExists = require('command-exists').sync
const path = require('path')
const chai = require('chai')
const expect = chai.expect

describe('linguist', function () {
  this.timeout(30000)
  const linguistInstalled = commandExists('github-linguist')

  if (!linguistInstalled) {
    it.skip('tests linguist functionality', () => {})
  } else {
    const linguistAxiom = require('../../axioms/linguist')

    it('runs linguist', () => {
      const mockFs = { targetDir: path.resolve(__dirname, '../../') }
      const res = linguistAxiom(mockFs)

      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length.greaterThan(0)
      expect(res.targets.map(t => t.path)).to.contain('javascript')
    })
  }
})
