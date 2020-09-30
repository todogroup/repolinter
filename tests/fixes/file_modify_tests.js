// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const nock = require('nock')
const chai = require('chai')
const expect = chai.expect

describe('fixes', () => {
  describe('file-modify', () => {
    const fileModify = require('../../fixes/file-modify')

    it('appends text to a file', async () => {
      const opts = {
        files: ['myfile'],
        text: 'this is text'
      }
      let mockContents = ''
      /** @type {any} */
      const mockFs = {
        findAllFiles () {
          return ['myfile']
        },
        getFileContents () {
          return 'the file contents'
        },
        setFileContents (file, contents) {
          mockContents = contents
        }
      }

      const res = await fileModify(mockFs, opts, [], false)

      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(1)
      expect(res.targets[0].path).to.equal('myfile')
      expect(res.targets[0].passed).to.equal(true)
      expect(mockContents).to.equal('the file contentsthis is text')
    })

    it('prepends text to a file', async () => {
      const opts = {
        files: ['myfile'],
        text: 'this is text',
        write_mode: 'prepend'
      }
      let mockContents = ''
      /** @type {any} */
      const mockFs = {
        findAllFiles () {
          return ['myfile']
        },
        getFileContents () {
          return 'the file contents'
        },
        setFileContents (file, contents) {
          mockContents = contents
        }
      }

      const res = await fileModify(mockFs, opts, [], false)

      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(1)
      expect(res.targets[0].path).to.equal('myfile')
      expect(res.targets[0].passed).to.equal(true)
      expect(mockContents).to.equal('this is textthe file contents')
    })

    it('does nothing if dryRun is enabled', async () => {
      const opts = {
        files: ['myfile'],
        text: 'this is text'
      }
      let mockContents = null
      /** @type {any} */
      const mockFs = {
        findAllFiles () {
          return ['myfile']
        },
        getFileContents () {
          return 'the file contents'
        },
        setFileContents (file, contents) {
          mockContents = contents
        }
      }

      const res = await fileModify(mockFs, opts, [], true)

      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(1)
      expect(res.targets[0].path).to.equal('myfile')
      expect(res.targets[0].passed).to.equal(true)
      expect(mockContents).to.equal(null)
    })

    it('targets a file specified by the rule', async () => {
      const opts = {
        text: 'this is text'
      }
      let mockContents = ''
      /** @type {any} */
      const mockFs = {
        findAllFiles () {
          return ['myfile']
        },
        getFileContents () {
          return 'the file contents'
        },
        setFileContents (file, contents) {
          mockContents = contents
        }
      }

      const res = await fileModify(mockFs, opts, ['myfile'], false)

      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(1)
      expect(res.targets[0].path).to.equal('myfile')
      expect(res.targets[0].passed).to.equal(true)
      expect(mockContents).to.equal('the file contentsthis is text')
    })

    it('fails if no files are specified', async () => {
      const opts = {
        text: 'this is text'
      }
      /** @type {any} */
      const mockFs = {}

      const res = await fileModify(mockFs, opts, [], false)

      expect(res.passed).to.equal(false)
      expect(res.targets).to.have.length(0)
    })

    it('skips extensions correctly', async () => {
      const opts = {
        text: 'this is text',
        'skip-paths-matching': { extensions: ['exe'] }
      }
      let mockFile = null
      /** @type {any} */
      const mockFs = {
        findAllFiles () {
          return ['myfile.exe', 'otherfile']
        },
        getFileContents () {
          return 'the file contents'
        },
        setFileContents (file, contents) {
          mockFile = file
        }
      }

      const res = await fileModify(mockFs, opts, ['myfile.exe'], false)

      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(1)
      expect(res.targets[0].path).to.equal('otherfile')
      expect(res.targets[0].passed).to.equal(true)
      expect(mockFile).to.equal('otherfile')
    })

    it('skips path patterns correctly', async () => {
      const opts = {
        text: 'this is text',
        'skip-paths-matching': { patterns: ['exe'] }
      }
      let mockFile = null
      /** @type {any} */
      const mockFs = {
        findAllFiles () {
          return ['myfile.exe', 'otherfile']
        },
        getFileContents () {
          return 'the file contents'
        },
        setFileContents (file, contents) {
          mockFile = file
        }
      }

      const res = await fileModify(mockFs, opts, ['myfile.exe'], false)

      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(1)
      expect(res.targets[0].path).to.equal('otherfile')
      expect(res.targets[0].passed).to.equal(true)
      expect(mockFile).to.equal('otherfile')
    })

    it('pulls text from a file', async () => {
      const opts = {
        files: ['myfile'],
        text: { file: 'sourcefile' }
      }
      let mockContents = null
      /** @type {any} */
      const mockFs = {
        findFirstFile () {
          return 'sourcefile'
        },
        findAllFiles () {
          return ['myfile']
        },
        getFileContents (file) {
          return file === 'myfile' ? 'the file contents' : 'this is text'
        },
        setFileContents (file, contents) {
          mockContents = contents
        }
      }

      const res = await fileModify(mockFs, opts, [], false)

      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(1)
      expect(res.targets[0].path).to.equal('myfile')
      expect(res.targets[0].passed).to.equal(true)
      expect(mockContents).to.equal('the file contentsthis is text')
    })

    it('pulls text from a URL', async () => {
      const opts = {
        files: ['myfile'],
        text: { url: 'https://example.com' }
      }
      let mockContents = null
      /** @type {any} */
      const mockFs = {
        findAllFiles () {
          return ['myfile']
        },
        getFileContents (file) {
          return 'the file contents'
        },
        setFileContents (file, contents) {
          mockContents = contents
        }
      }
      const scope = nock('https://example.com')
        .get('/')
        .reply(200, 'this is text')

      const res = await fileModify(mockFs, opts, [], false)

      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(1)
      expect(res.targets[0].path).to.equal('myfile')
      expect(res.targets[0].passed).to.equal(true)
      expect(mockContents).to.equal('the file contentsthis is text')

      scope.done()
    })

    it('adds newlines correctly', async () => {
      const opts = {
        files: ['myfile'],
        text: 'this is text',
        newlines: { begin: 3, end: 4 }
      }
      let mockContents = ''
      /** @type {any} */
      const mockFs = {
        findAllFiles () {
          return ['myfile']
        },
        getFileContents () {
          return 'the file contents'
        },
        setFileContents (file, contents) {
          mockContents = contents
        }
      }

      const res = await fileModify(mockFs, opts, [], false)

      expect(res.passed).to.equal(true)
      expect(mockContents).to.equal('the file contents\n\n\nthis is text\n\n\n\n')
    })
  })
})
