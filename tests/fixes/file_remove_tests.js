// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect

describe('fixes', () => {
  describe('file-remove', () => {
    const fileRemove = require('../../fixes/file-remove')

    it('removes a file', async () => {
      const removePaths = []
      /** @type {any} */
      const mockFs = {
        removeFile(path) {
          removePaths.push(path)
        }
      }

      const res = await fileRemove(mockFs, {}, ['myfile'], false)
      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(1)
      expect(res.targets[0].passed).to.equal(true)
      expect(res.targets[0].path).to.equal('myfile')
      expect(removePaths).to.deep.equal(['myfile'])
    })

    it('does nothing if dryRun is true', async () => {
      const removePaths = []
      /** @type {any} */
      const mockFs = {
        removeFile(path) {
          removePaths.push(path)
        }
      }

      const res = await fileRemove(mockFs, {}, ['myfile'], true)
      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(1)
      expect(res.targets[0].passed).to.equal(true)
      expect(res.targets[0].path).to.equal('myfile')
      expect(removePaths).to.deep.equal([])
    })

    it('removes multiple files', async () => {
      const removePaths = []
      /** @type {any} */
      const mockFs = {
        removeFile(path) {
          removePaths.push(path)
        }
      }

      const res = await fileRemove(mockFs, {}, ['myfile', 'otherfile'], false)
      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(2)
      expect(res.targets[0].passed).to.equal(true)
      expect(res.targets[0].path).to.equal('myfile')
      expect(res.targets[1].passed).to.equal(true)
      expect(res.targets[1].path).to.equal('otherfile')
      expect(removePaths).to.deep.equal(['myfile', 'otherfile'])
    })

    it('uses the glob option', async () => {
      const removePaths = []
      /** @type {any} */
      const mockFs = {
        removeFile(path) {
          removePaths.push(path)
        },
        findAllFiles() {
          return ['myfile.txt']
        }
      }

      const res = await fileRemove(mockFs, { globsAll: ['myfile'] }, [], false)
      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(1)
      expect(res.targets[0].passed).to.equal(true)
      expect(res.targets[0].path).to.equal('myfile.txt')
      expect(removePaths).to.deep.equal(['myfile.txt'])
    })

    it('overrides targets with the glob option', async () => {
      const removePaths = []
      /** @type {any} */
      const mockFs = {
        removeFile(path) {
          removePaths.push(path)
        },
        findAllFiles() {
          return ['myfile.txt']
        }
      }

      const res = await fileRemove(
        mockFs,
        { globsAll: ['myfile'] },
        ['otherfile'],
        false
      )
      expect(res.passed).to.equal(true)
      expect(res.targets).to.have.length(1)
      expect(res.targets[0].passed).to.equal(true)
      expect(res.targets[0].path).to.equal('myfile.txt')
      expect(removePaths).to.deep.equal(['myfile.txt'])
    })

    it('returns failure if no files are found', async () => {
      /** @type {any} */
      const mockFs = {}

      const res = await fileRemove(mockFs, {}, [], false)
      expect(res.passed).to.equal(false)
      expect(res.targets).to.have.length(0)
    })
  })
})
