// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const chai = require('chai')
const nock = require('nock')
const expect = chai.expect
const FileSystem = require('../../lib/file_system')
const { commandExists } = require('../../lib/command_exists')

describe('rule', () => {
  describe('files_no_broken_links', function () {
    const gitHubMarkupInstalled = commandExists('github-markup')
    const fileNoBrokenLinks = require('../../rules/file-no-broken-links')
    const targetDir = `${__dirname}/markup_test_files`
    const testFs = new FileSystem(targetDir)

    this.timeout(30000)

    if (!gitHubMarkupInstalled)
      it.skip('tests file_no_broken_links functionality', () => {})
    else {
      it('returns true if no links are present in markdown', async () => {
        const ruleopts = {
          globsAll: ['no_link.md']
        }

        const actual = await fileNoBrokenLinks(testFs, ruleopts)

        expect(actual.passed).to.equal(true)
        expect(actual.targets).to.have.length(1)
        expect(actual.targets[0]).to.deep.include({
          passed: true,
          path: 'no_link.md'
        })
      })

      it('returns true if a valid link is present in a markdown file', async () => {
        const scope = nock('https://www.example.com')
          .head('/something/somethingelse')
          .reply(200)

        const ruleopts = {
          globsAll: ['link.md']
        }

        const actual = await fileNoBrokenLinks(testFs, ruleopts)

        expect(actual.passed).to.equal(true)
        expect(actual.targets).to.have.length(1)
        expect(actual.targets[0]).to.deep.include({
          passed: true,
          path: 'link.md'
        })

        scope.done()
      })

      it('returns false if an invalid link is present in a markdown file', async () => {
        const scope = nock('https://www.example.com')
          .head('/something/somethingelse')
          .replyWithError('nxdomain or something')

        const ruleopts = {
          globsAll: ['link.md']
        }

        const actual = await fileNoBrokenLinks(testFs, ruleopts)

        expect(actual.passed).to.equal(false)
        expect(actual.targets).to.have.length(1)
        expect(actual.targets[0]).to.deep.include({
          passed: false,
          path: 'link.md'
        })

        scope.done()
      })

      it('returns false if a private link is present in a markdown file', async () => {
        const scope = nock('https://www.example.com')
          .head('/something/somethingelse')
          .reply(404)

        const ruleopts = {
          globsAll: ['link.md']
        }

        const actual = await fileNoBrokenLinks(testFs, ruleopts)

        expect(actual.passed).to.equal(false)
        expect(actual.targets).to.have.length(1)
        expect(actual.targets[0]).to.deep.include({
          passed: false,
          path: 'link.md'
        })

        scope.done()
      })

      it('returns true if a valid link is present in an rst file', async () => {
        const scope = nock('https://www.example.com')
          .head('/something/somethingelse')
          .reply(200)

        const ruleopts = {
          globsAll: ['link.rst']
        }

        const actual = await fileNoBrokenLinks(testFs, ruleopts)

        expect(actual.passed).to.equal(true)
        expect(actual.targets).to.have.length(1)
        expect(actual.targets[0]).to.deep.include({
          passed: true,
          path: 'link.rst'
        })

        scope.done()
      })

      it('returns false if an invalid link is present in an rst file', async () => {
        const scope = nock('https://www.example.com')
          .head('/something/somethingelse')
          .replyWithError('nxdomain or something')

        const ruleopts = {
          globsAll: ['link.rst']
        }

        const actual = await fileNoBrokenLinks(testFs, ruleopts)

        expect(actual.passed).to.equal(false)
        expect(actual.targets).to.have.length(1)
        expect(actual.targets[0]).to.deep.include({
          passed: false,
          path: 'link.rst'
        })

        scope.done()
      })

      it('ignores section links in markdown', async () => {
        const ruleopts = {
          globsAll: ['section_link.md']
        }

        const actual = await fileNoBrokenLinks(testFs, ruleopts)

        expect(actual.passed).to.equal(true)
        expect(actual.targets).to.have.length(1)
        expect(actual.targets[0]).to.deep.include({
          passed: true,
          path: 'section_link.md'
        })
      })

      it('ignores section links in rst', async () => {
        const ruleopts = {
          globsAll: ['section_link.rst']
        }

        const actual = await fileNoBrokenLinks(testFs, ruleopts)

        expect(actual.passed).to.equal(true)
        expect(actual.targets).to.have.length(1)
        expect(actual.targets[0]).to.deep.include({
          passed: true,
          path: 'section_link.rst'
        })
      })

      it('returns true with a relative link to a file in markdown', async () => {
        const ruleopts = {
          globsAll: ['relative_link.md']
        }

        const actual = await fileNoBrokenLinks(testFs, ruleopts)

        expect(actual.passed).to.equal(true)
        expect(actual.targets).to.have.length(1)
        expect(actual.targets[0]).to.deep.include({
          passed: true,
          path: 'relative_link.md'
        })
      })

      it('returns true with a relative link to a file in markdown with a section link', async () => {
        const ruleopts = {
          globsAll: ['relative_link_with_section.md']
        }

        const actual = await fileNoBrokenLinks(testFs, ruleopts)

        expect(actual.passed).to.equal(true)
        expect(actual.targets).to.have.length(1)
        expect(actual.targets[0]).to.deep.include({
          passed: true,
          path: 'relative_link_with_section.md'
        })
      })

      it('returns true with a relative link to a file in markdown outside the working directory', async () => {
        const ruleopts = {
          globsAll: ['relative_link_outside_dir.md']
        }

        const actual = await fileNoBrokenLinks(testFs, ruleopts)

        expect(actual.passed).to.equal(true)
        expect(actual.targets).to.have.length(1)
        expect(actual.targets[0]).to.deep.include({
          passed: true,
          path: 'relative_link_outside_dir.md'
        })
      })

      it("returns false with a relative link to a file that doesn't exist in markdown", async () => {
        const ruleopts = {
          globsAll: ['invalid_relative_link.md']
        }

        const actual = await fileNoBrokenLinks(testFs, ruleopts)

        expect(actual.passed).to.equal(false)
        expect(actual.targets).to.have.length(1)
        expect(actual.targets[0]).to.deep.include({
          passed: false,
          path: 'invalid_relative_link.md'
        })
      })

      it('returns false with a absolute path in markdown', async () => {
        const ruleopts = {
          globsAll: ['absolute_link.md']
        }

        const actual = await fileNoBrokenLinks(testFs, ruleopts)

        expect(actual.passed).to.equal(false)
        expect(actual.targets).to.have.length(1)
        expect(actual.targets[0]).to.deep.include({
          passed: false,
          path: 'absolute_link.md'
        })
      })

      it('checks multiple links in markdown', async () => {
        const scope = nock('https://www.example.com')
          .head('/something/somethingelse')
          .reply(200)
        const scope2 = nock('www.example.com').head('/something').reply(200)

        const ruleopts = {
          globsAll: ['multiple_links.md']
        }

        const actual = await fileNoBrokenLinks(testFs, ruleopts)

        expect(actual.passed).to.equal(true)
        expect(actual.targets).to.have.length(1)
        expect(actual.targets[0]).to.deep.include({
          passed: true,
          path: 'multiple_links.md'
        })

        scope.done()
        scope2.done()
      })

      it('checks multiple files', async () => {
        const scope = nock('https://www.example.com')
          .head('/something/somethingelse')
          .reply(200)
        const scope2 = nock('https://www.example.com')
          .head('/something')
          .reply(200)

        const ruleopts = {
          globsAll: ['link.md', 'link.rst']
        }

        const actual = await fileNoBrokenLinks(testFs, ruleopts)

        expect(actual.passed).to.equal(true)
        expect(actual.targets).to.have.length(2)
        expect(actual.targets[0]).to.deep.include({
          passed: true,
          path: 'link.md'
        })
        expect(actual.targets[1]).to.deep.include({
          passed: true,
          path: 'link.rst'
        })

        scope.done()
        scope2.done()
      })

      it('fails if no files are found', async () => {
        const ruleopts = {
          globsAll: ['notafile']
        }

        const actual = await fileNoBrokenLinks(testFs, ruleopts)

        expect(actual.passed).to.equal(false)
        expect(actual.targets).to.have.length(0)
      })

      it('succeeds if no files are found and succeed-on-non-existent is true', async () => {
        const ruleopts = {
          globsAll: ['notafile'],
          'succeed-on-non-existent': true
        }

        const actual = await fileNoBrokenLinks(testFs, ruleopts)

        expect(actual.passed).to.equal(true)
        expect(actual.targets).to.have.length(0)
      })
    }
  })
})
