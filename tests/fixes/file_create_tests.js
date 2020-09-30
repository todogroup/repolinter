// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const nock = require('nock')
const chai = require('chai')
const expect = chai.expect

describe('fixes', () => {
  describe('file-create', () => {
    const fileCreate = require('../../fixes/file-create')

    it('creates a file', async () => {
      const opts = {
        file: 'myfile',
        text: 'this is text'
      }
      let mockContents = null
      /** @type {any} */
      const mockFs = {
        relativeFileExists () {
          return false
        },
        setFileContents (file, contents) {
          mockContents = contents
        }
      }

      const res = await fileCreate(mockFs, opts, [], false)

      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(1)
      expect(res.targets[0].path).to.equal('myfile')
      expect(res.targets[0].passed).to.equal(true)
      expect(mockContents).to.equal('this is text')
    })

    it('does nothing if dryRun is true', async () => {
      const opts = {
        file: 'myfile',
        text: 'this is text'
      }
      let mockContents = null
      /** @type {any} */
      const mockFs = {
        relativeFileExists () {
          return false
        },
        setFileContents (file, contents) {
          mockContents = contents
        }
      }

      const res = await fileCreate(mockFs, opts, [], true)

      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(1)
      expect(res.targets[0].path).to.equal('myfile')
      expect(res.targets[0].passed).to.equal(true)
      expect(mockContents).to.equal(null)
    })

    it('returns an error if the targets are supplied and replace is false', async () => {
      const opts = {
        file: 'myfile',
        text: 'this is text'
      }
      let mockContents = null
      /** @type {any} */
      const mockFs = {
        relativeFileExists () {
          return false
        },
        setFileContents (file, contents) {
          mockContents = contents
        }
      }

      const res = await fileCreate(mockFs, opts, ['somefile'], false)

      expect(res.passed).to.equal(false)
      expect(mockContents).to.equal(null)
    })

    it('returns an error if the file exists and replace is false', async () => {
      const opts = {
        file: 'myfile',
        text: 'this is text'
      }
      let mockContents = null
      /** @type {any} */
      const mockFs = {
        relativeFileExists () {
          return true
        },
        setFileContents (file, contents) {
          mockContents = contents
        }
      }

      const res = await fileCreate(mockFs, opts, [], false)

      expect(res.passed).to.equal(false)
      expect(mockContents).to.equal(null)
    })

    it('pulls text from a file', async () => {
      const opts = {
        file: 'myfile',
        text: { file: 'sourcefile' }
      }
      let mockContents = null
      /** @type {any} */
      const mockFs = {
        findFirstFile () {
          return 'sourcefile'
        },
        getFileContents () {
          return 'this is text'
        },
        relativeFileExists () {
          return false
        },
        setFileContents (file, contents) {
          mockContents = contents
        }
      }

      const res = await fileCreate(mockFs, opts, [], false)

      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(1)
      expect(res.targets[0].path).to.equal('myfile')
      expect(res.targets[0].passed).to.equal(true)
      expect(mockContents).to.equal('this is text')
    })

    it('pulls text from a URL', async () => {
      const opts = {
        file: 'myfile',
        text: { url: 'https://example.com' }
      }
      let mockContents = null
      /** @type {any} */
      const mockFs = {
        relativeFileExists () {
          return false
        },
        setFileContents (file, contents) {
          mockContents = contents
        }
      }
      const scope = nock('https://example.com')
        .get('/')
        .reply(200, 'this is text')

      const res = await fileCreate(mockFs, opts, [], false)

      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(1)
      expect(res.targets[0].path).to.equal('myfile')
      expect(res.targets[0].passed).to.equal(true)
      expect(mockContents).to.equal('this is text')

      scope.done()
    })

    it('removes old files if replace is true', async () => {
      const opts = {
        file: 'myfile',
        text: 'this is text',
        replace: true
      }
      let mockContents = null
      let mockRemove = null
      /** @type {any} */
      const mockFs = {
        relativeFileExists () {
          return false
        },
        setFileContents (file, contents) {
          mockContents = contents
        },
        removeFile (file) {
          mockRemove = file
        }
      }

      const res = await fileCreate(mockFs, opts, ['oldfile'], false)

      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(2)
      expect(res.targets[0].path).to.equal('myfile')
      expect(res.targets[0].passed).to.equal(true)
      expect(res.targets[1].path).to.equal('oldfile')
      expect(res.targets[1].passed).to.equal(true)
      expect(mockContents).to.equal('this is text')
      expect(mockRemove).to.equal('oldfile')
    })
  })
})
