// Copyright 2022 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const nock = require('nock')
const expect = chai.expect

describe('rule', () => {
  describe('Best Practices Badge', () => {
    const BestpracticesBadgePresent = require('../../rules/best-practices-badge-present')

    it('fails if readme is missing', async () => {
      const mockfs = {
        findAllFiles: _ => [],
        getFileContents: _ => null,
        targetDir: '.'
      }

      const actual = await BestpracticesBadgePresent(mockfs)
      expect(actual.passed).to.equal(false)
      expect(actual.message).to.include('not find')
    })

    it('fails if readme does not contain the Best Practices Badge', async () => {
      const mockfs = {
        findAllFiles: _ => ['README'],
        getFileContents: _ => '...',
        targetDir: '.'
      }

      const actual = await BestpracticesBadgePresent(mockfs)
      expect(actual.passed).to.equal(false)
      expect(actual.targets.length).to.equal(1)
      expect(actual.targets[0].message).to.equal(
        "Doesn't contain Best Practices Badge"
      )
    })

    it('passes if readme contains the Best Practices badge (URL with locale)', async () => {
      const mockfs = {
        findAllFiles: _ => ['README'],
        getFileContents: _ =>
          '[badge](https://bestpractices.coreinfrastructure.org/en/projects/100)',
        targetDir: '.'
      }

      const actual = await BestpracticesBadgePresent(mockfs)
      expect(actual.passed).to.equal(true)
    })

    it('passes if readme contains the Best Practices Badge (URL without locale)', async () => {
      const mockfs = {
        findAllFiles: _ => ['README'],
        getFileContents: _ =>
          '[badge](https://bestpractices.coreinfrastructure.org/projects/100)',
        targetDir: '.'
      }

      const actual = await BestpracticesBadgePresent(mockfs)
      expect(actual.passed).to.equal(true)
    })

    it('fails if readme contains the Best Practices Badge has invalid URL', async () => {
      const mockfs = {
        findAllFiles: _ => ['README'],
        getFileContents: _ =>
          'https://bestpractices.coreinfrastructure.org/en/projects/wrong',
        targetDir: '.'
      }

      const actual = await BestpracticesBadgePresent(mockfs)
      expect(actual.passed).to.equal(false)
    })
    describe('minPercentage', () => {
      const mockfs = {
        findAllFiles: _ => ['README'],
        getFileContents: _ =>
          '[badge](https://bestpractices.coreinfrastructure.org/projects/100)',
        targetDir: '.'
      }

      it('passes when minPercentage is not set', async () => {
        const actual = await BestpracticesBadgePresent(mockfs, {
          minPercentage: null
        })
        expect(actual.passed).to.equal(true)
      })

      it('passes when minPercentage is set to 0', async () => {
        const actual = await BestpracticesBadgePresent(mockfs, {
          minPercentage: 0
        })
        expect(actual.passed).to.equal(true)
      })

      it('fails when minPercentage is > than percentage returned by API', async () => {
        const scope = nock('https://bestpractices.coreinfrastructure.org')
          .get('/projects/100.json')
          .reply(200, { tiered_percentage: 99 })

        const actual = await BestpracticesBadgePresent(mockfs, {
          minPercentage: 100
        })
        expect(actual.passed).to.equal(false)
        scope.done()
      })

      it('fails when minPercentage is set but API does not return 200', async () => {
        const scope = nock('https://bestpractices.coreinfrastructure.org')
          .get('/projects/100.json')
          .reply(404)

        const actual = await BestpracticesBadgePresent(mockfs, {
          minPercentage: 100
        })
        expect(actual.passed).to.equal(false)
        scope.done()
      })

      it('passes when minPercentage is <= than percentage returned by API', async () => {
        const scope = nock('https://bestpractices.coreinfrastructure.org')
          .get('/projects/100.json')
          .reply(200, { tiered_percentage: 100 })

        const actual = await BestpracticesBadgePresent(mockfs, {
          minPercentage: 100
        })
        expect(actual.passed).to.equal(true)
        scope.done()
      })
    })
  })
})
