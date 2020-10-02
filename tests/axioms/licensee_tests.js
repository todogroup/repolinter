// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const commandExists = require('command-exists').sync
const path = require('path')
const chai = require('chai')
const expect = chai.expect

describe('licensee', function () {
  const licenseeInstalled = commandExists('licensee')
  this.timeout(30000)

  if (!licenseeInstalled) {
    it.skip('tests licensee functionality', () => {})
  } else {
    const licenseeAxiom = require('../../axioms/licensee')

    it('runs licensee', async () => {
      const mockFs = { targetDir: path.resolve(__dirname, '../../') }
      const res = await licenseeAxiom(mockFs)

      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(1)
      expect(res.targets[0].path).to.equal('Apache-2.0')
    })

    it('returns nothing if no licenses are found', async () => {
      const mockFs = { targetDir: path.resolve(__dirname) }
      const res = await licenseeAxiom(mockFs)

      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(0)
    })
  }
})
