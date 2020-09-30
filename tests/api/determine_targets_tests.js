// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const path = require('path')
const expect = chai.expect
const repolinter = require(path.resolve('.'))

describe('api', () => {
  describe('determineTargets', () => {
    it('returns a list of packagers for a directory', async () => {
      const mockconfig = {
        packagers: 'package'
      }
      const mockFs = {
        findFirst (pattern) {
          return pattern === 'package.json' ? 'package.json' : null
        }
      }
      const actual = await repolinter.determineTargets(mockconfig, mockFs)
      expect(actual).to.deep.equal({ package: { passed: true, targets: [{ passed: true, path: 'npm' }] } })
    })

    it('does nothing if no axioms are specified', async () => {
      const mockconfig = {}
      const mockFs = {}
      const actual = await repolinter.determineTargets(mockconfig, mockFs)
      expect(actual).to.deep.equal({})
    })

    it('returns a failing result if an invalid axiom is specified', async () => {
      const mockconfig = {
        notanaxiom: 'banana'
      }
      const mockFs = {}
      const actual = await repolinter.determineTargets(mockconfig, mockFs)
      expect(actual).to.deep.equal({ banana: { passed: false, message: 'invalid axiom name notanaxiom', targets: [] } })
    })
  })
})
