// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const chai = require('chai');
const expect = chai.expect;

describe('rules', () => {
  describe('file_type_exclusion', () => {
    it('returns passes if requested file type doesn\'t exist', () => {
      const file_type_exclusion = require('../../rules/file_type_exclusion');
      const result = file_type_exclusion({
        fs: {
          find_all() {
          }
        },
        type: ['*.dll']
      }, '.');

      expect(result).to.deep.equal({ passes: ['Excluded file type doesn\'t exist (*.dll)'] });
    });

    it('returns failures if requested file type exists', () => {
      const file_type_exclusion = require('../../rules/file_type_exclusion');
      const result = file_type_exclusion({
        fs: {
          find_all() {
            return 'foo.dll'
          }
        },
        type: ['*.dll']
      }, '.');

      expect(result).to.deep.equal({ failures: ['Excluded file type exists (foo.dll)'] });
    });
  });
});