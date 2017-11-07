// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const chai = require('chai')
const expect = chai.expect

describe('rule', () => {
  describe('files_existence', () => {
    it('returns passes if requested file exists', () => {
      const fileExistence = require('../../rules/file-existence')
      const result = fileExistence('.', {
        fs: {
          findFirst () {
            return 'foo'
          }
        },
        files: ['LICENSE*'],
        name: 'License file'
      })

      expect(result).to.deep.equal({ passes: ['found (foo)'] })
    })

    it('returns failures if requested file doesn\'t exist', () => {
      const fileExistence = require('../../rules/file-existence')
      const result = fileExistence('.', {
        fs: {
          findFirst () {
          }
        },
        files: ['LICENSE*'],
        name: 'License file'
      })

      expect(result).to.deep.equal({ failures: ['not found'] })
    })
  })
})
