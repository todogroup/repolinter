// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const path = require('path')
const expect = chai.expect
const repolinter = require(path.resolve('.'))

describe('api', () => {
  describe('parseConfig', () => {
    it('parses a config into RuleInfo object', () => {
      const mockConfig = {
        version: 2,
        rules: {
          'my-rule': {
            level: 'error',
            rule: {
              type: 'some-rule',
              options: {}
            }
          }
        }
      }

      const parsed = repolinter.parseConfig(mockConfig)

      expect(parsed).to.have.length(1)
      expect(parsed[0].name).to.equal('my-rule')
      expect(parsed[0].level).to.equal('error')
      expect(parsed[0].where).to.have.length(0)
      expect(parsed[0].ruleType).to.equal('some-rule')
      expect(parsed[0].ruleConfig).to.deep.equal({})
      expect(parsed[0].fixType).to.equal(undefined)
    })

    it('parses multiple config objects', () => {
      const mockConfig = {
        version: 2,
        rules: {
          'my-rule': {
            level: 'error',
            rule: {
              type: 'some-rule',
              options: {}
            }
          },
          'my-other-rule': {
            level: 'error',
            rule: {
              type: 'some-other-rule',
              options: {}
            }
          }
        }
      }

      const parsed = repolinter.parseConfig(mockConfig)

      expect(parsed).to.have.length(2)
      expect(parsed[0].name).to.equal('my-rule')
      expect(parsed[0].level).to.equal('error')
      expect(parsed[0].where).to.have.length(0)
      expect(parsed[0].ruleType).to.equal('some-rule')
      expect(parsed[0].ruleConfig).to.deep.equal({})
      expect(parsed[0].fixType).to.equal(undefined)
      expect(parsed[1].name).to.equal('my-other-rule')
      expect(parsed[1].level).to.equal('error')
      expect(parsed[1].where).to.have.length(0)
      expect(parsed[1].ruleType).to.equal('some-other-rule')
      expect(parsed[1].ruleConfig).to.deep.equal({})
      expect(parsed[1].fixType).to.equal(undefined)
    })

    it('parses a where condition', () => {
      const mockConfig = {
        version: 2,
        rules: {
          'my-rule': {
            level: 'error',
            where: ['condition=true'],
            rule: {
              type: 'some-rule',
              options: {}
            }
          }
        }
      }

      const parsed = repolinter.parseConfig(mockConfig)

      expect(parsed).to.have.length(1)
      expect(parsed[0].name).to.equal('my-rule')
      expect(parsed[0].level).to.equal('error')
      expect(parsed[0].where).to.have.length(1)
      expect(parsed[0].where[0]).to.equal('condition=true')
      expect(parsed[0].ruleType).to.equal('some-rule')
      expect(parsed[0].ruleConfig).to.deep.equal({})
      expect(parsed[0].fixType).to.equal(undefined)
    })

    it('parses a fix', () => {
      const mockConfig = {
        version: 2,
        rules: {
          'my-rule': {
            level: 'error',
            rule: {
              type: 'some-rule',
              options: {}
            },
            fix: {
              type: 'some-fix',
              options: {}
            }
          }
        }
      }

      const parsed = repolinter.parseConfig(mockConfig)

      expect(parsed).to.have.length(1)
      expect(parsed[0].name).to.equal('my-rule')
      expect(parsed[0].level).to.equal('error')
      expect(parsed[0].where).to.have.length(0)
      expect(parsed[0].ruleType).to.equal('some-rule')
      expect(parsed[0].ruleConfig).to.deep.equal({})
      expect(parsed[0].fixType).to.equal('some-fix')
      expect(parsed[0].fixConfig).to.deep.equal({})
    })

    it('reads the policyInfo and policyUrl', () => {
      const mockConfig = {
        version: 2,
        rules: {
          'my-rule': {
            rule: {
              type: 'some-rule',
              options: {}
            },
            policyInfo: 'This is some official guidance',
            policyUrl: 'www.example.com'
          }
        }
      }

      const parsed = repolinter.parseConfig(mockConfig)

      expect(parsed).to.have.length(1)
      expect(parsed[0].policyInfo).to.equal(
        mockConfig.rules['my-rule'].policyInfo
      )
      expect(parsed[0].policyUrl).to.equal(
        mockConfig.rules['my-rule'].policyUrl
      )
    })
  })
})
