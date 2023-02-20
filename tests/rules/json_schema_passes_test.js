// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect

describe('rule', () => {
  describe('json_schema_passes', () => {
    const jsonSchemaPasses = require('../../rules/json-schema-passes')
    it('returns passes if requested file matches the schema', async () => {
      /** @type {any} */
      const mockfs = {
        findFirstFile() {
          return 'README.md'
        },
        getFileContents() {
          return '{ "thing": "hello" }'
        },
        targetDir: '.'
      }

      const ruleopts = {
        glob: 'README.md',
        schema: {
          properties: {
            thing: { const: 'hello' }
          },
          required: ['thing']
        }
      }

      const actual = await jsonSchemaPasses(mockfs, ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].passed).to.equal(true)
      expect(actual.targets[0].path).to.equal(mockfs.findFirstFile())
      expect(actual.targets[0].pattern).to.equal(ruleopts.glob)
    })

    it('returns fail if requested file does not match the schema', async () => {
      /** @type {any} */
      const mockfs = {
        findFirstFile() {
          return 'README.md'
        },
        getFileContents() {
          return '{ "thing": "nothello" }'
        },
        targetDir: '.'
      }

      const ruleopts = {
        glob: 'README.md',
        schema: {
          properties: {
            thing: { const: 'hello' }
          },
          required: ['thing']
        }
      }

      const actual = await jsonSchemaPasses(mockfs, ruleopts)

      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].passed).to.equal(false)
      expect(actual.targets[0].path).to.equal(mockfs.findFirstFile())
      expect(actual.targets[0].pattern).to.equal(ruleopts.glob)
    })

    it('throws if the schema is invalid', async () => {
      /** @type {any} */
      const mockfs = {
        findFirstFile() {
          return 'README.md'
        },
        getFileContents() {
          return '{ "thing": "hello" }'
        },
        targetDir: '.'
      }

      const ruleopts = {
        glob: 'README.md',
        schema: {
          properties: {
            thing: { type: 'any' }
          },
          required: ['thing']
        }
      }

      await expect(
        jsonSchemaPasses(mockfs, ruleopts)
      ).to.eventually.be.rejectedWith(Error)
    })

    it('returns fail if the file had invalid JSON', async () => {
      /** @type {any} */
      const mockfs = {
        findFirstFile() {
          return 'README.md'
        },
        getFileContents() {
          return '{ "thing": "hello"'
        },
        targetDir: '.'
      }

      const ruleopts = {
        glob: 'README.md',
        schema: {
          properties: {
            thing: { const: 'hello' }
          },
          required: ['thing']
        }
      }

      const actual = await jsonSchemaPasses(mockfs, ruleopts)

      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].passed).to.equal(false)
      expect(actual.targets[0].path).to.equal(mockfs.findFirstFile())
      expect(actual.targets[0].pattern).to.equal(ruleopts.glob)
    })

    it('succeeds if the file does not exist and succeed-on-non-existent is set', async () => {
      /** @type {any} */
      const mockfs = {
        findFirstFile() {
          return undefined
        },
        getFileContents() {
          return undefined
        },
        targetDir: '.'
      }

      const ruleopts = {
        glob: 'README.md',
        schema: {
          properties: {
            thing: { const: 'hello' }
          },
          required: ['thing']
        },
        'succeed-on-non-existent': true
      }

      const actual = await jsonSchemaPasses(mockfs, ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].pattern).to.equal(ruleopts.glob)
      expect(actual.targets[0].path).to.equal(undefined)
    })

    it('returns fail if the file does not exist', async () => {
      /** @type {any} */
      const mockfs = {
        findFirstFile() {
          return undefined
        },
        getFileContents() {
          return undefined
        },
        targetDir: '.'
      }

      const ruleopts = {
        glob: 'README.md',
        schema: {
          properties: {
            thing: { const: 'hello' }
          },
          required: ['thing']
        }
      }

      const actual = await jsonSchemaPasses(mockfs, ruleopts)

      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].pattern).to.equal(ruleopts.glob)
      expect(actual.targets[0].path).to.equal(undefined)
    })

    it('includes human-readable-message in the output', async () => {
      /** @type {any} */
      const mockfs = {
        findFirstFile() {
          return 'README.md'
        },
        getFileContents() {
          return '{ "thing": "nothello" }'
        },
        targetDir: '.'
      }

      const ruleopts = {
        glob: 'README.md',
        schema: {
          properties: {
            thing: { const: 'hello' }
          },
          required: ['thing']
        },
        'human-readable-message': 'foo'
      }

      const actual = await jsonSchemaPasses(mockfs, ruleopts)

      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].passed).to.equal(false)
      expect(actual.targets[0].path).to.equal(mockfs.findFirstFile())
      expect(actual.targets[0].pattern).to.equal(ruleopts.glob)
      expect(actual.targets[0].message).to.contain(
        ruleopts['human-readable-message']
      )
    })
  })
})
