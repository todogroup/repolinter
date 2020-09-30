// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const path = require('path')
const expect = chai.expect
const repolinter = require(path.resolve('.'))

describe('api', () => {
  describe('validateConfig', () => {
    it('validates a configuration', async () => {
      const mockconfig = {
        axioms: {},
        rules: {
          myrule: {
            level: 'error',
            rule: {
              type: 'apache-notice',
              options: {}
            }
          }
        },
        version: 2
      }

      const { passed, error } = await repolinter.validateConfig(mockconfig)

      expect(error).to.equal(undefined)
      expect(passed).to.equal(true)
    })

    it('validates a legacy configuration', async () => {
      const mockconfig = {
        axioms: {},
        rules: {}
      }

      const { passed, error } = await repolinter.validateConfig(mockconfig)

      expect(error).to.equal(undefined)
      expect(passed).to.equal(true)
    })

    it('rejects an invalid configuration', async () => {
      const mockconfig = {
        version: 2
      }

      const { passed, error } = await repolinter.validateConfig(mockconfig)

      expect(error).not.to.equal(undefined)
      expect(passed).to.equal(false)
    })

    it('rejects a non-object configuration', async () => {
      const { passed, error } = await repolinter.validateConfig(7)

      expect(error).not.to.equal(undefined)
      expect(passed).to.equal(false)
    })

    it('rejects an invalid error level', async () => {
      const mockconfig = {
        axioms: {},
        rules: {
          myrule: {
            level: 'banana',
            rule: {
              type: 'apache-notice',
              options: {}
            }
          }
        },
        version: 2
      }

      const { passed, error } = await repolinter.validateConfig(mockconfig)

      expect(error).not.to.equal(undefined)
      expect(passed).to.equal(false)
    })

    it('rejects invalid rule options', async () => {
      const mockconfig = {
        axioms: {},
        rules: {
          myrule: {
            level: 'error',
            rule: {
              type: 'file-contents',
              options: {}
            }
          }
        },
        version: 2
      }

      const { passed, error } = await repolinter.validateConfig(mockconfig)

      expect(error).not.to.equal(undefined)
      expect(passed).to.equal(false)
    })
  })
})
