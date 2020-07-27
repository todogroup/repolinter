const chai = require('chai')
const path = require('path')
const expect = chai.expect
const repolinter = require(path.resolve('.'))

describe('api', () => {
  describe('parseConfig', () => {
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
      expect(parsed[0].policyInfo).to.equal(mockConfig.rules['my-rule'].policyInfo)
      expect(parsed[0].policyUrl).to.equal(mockConfig.rules['my-rule'].policyUrl)
    })
  })
})
