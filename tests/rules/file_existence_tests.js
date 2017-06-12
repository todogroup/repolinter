const chai = require('chai');
const expect = chai.expect;

describe('rules', () => {
  describe('files_existence', () => {
    it('returns passes if requested file exists', () => {
      const file_existence = require('../../rules/file_existence');
      const result = file_existence({
        fs: {
          find_first() {
            return 'foo'
          }
        },
        files: ['LICENSE*'],
        name: 'License file'
      }, '.');

      expect(result).to.deep.equal({ passes: ['License file exists (foo)'] });
    });

    it('returns failures if requested file doesn\'t exist', () => {
      const file_existence = require('../../rules/file_existence');
      const result = file_existence({
        fs: {
          find_first() {
          }
        },
        files: ['LICENSE*'],
        name: 'License file'
      }, '.');

      expect(result).to.deep.equal({ failures: ['License file doesn\'t exist'] });
    });
  });
});