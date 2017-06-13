// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const chai = require('chai');
const expect = chai.expect;

describe('rules', () => {
  describe('files_contents', () => {
    it('returns passes if requested file contents exists', () => {
      const fileContents = require('../../rules/file_contents');
      const result = fileContents({
        fs: {
          getFileContents() {
            return 'foo'
          }
        },
        file: 'README.md',
        content: 'foo'
      }, '.');

      expect(result).to.deep.equal({ passes: ['File README.md contains foo'] });
    });

    it('returns fails if requested file contents does not exist', () => {
      const fileContents = require('../../rules/file_contents');
      const result = fileContents({
        fs: {
          getFileContents() {
            return 'foo'
          }
        },
        file: 'README.md',
        content: 'bar'
      }, '.');

      expect(result).to.deep.equal({ failures: ['File README.md doesn\'t contain bar'] });
    });

    it('returns nothing if requested file does not exist', () => {
      const fileContents = require('../../rules/file_contents');
      const result = fileContents({
        fs: {
          getFileContents() {
            return
          }
        },
        file: 'README.md',
        content: 'foo'
      }, '.');

      expect(result).to.deep.equal({});
    });
  });
});