// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const GitHubMarkup = require('../../lib/github_markup')
const { commandExists } = require('../../lib/command_exists')

describe('lib', () => {
  describe('github_markup', function () {
    const gitHubMarkupInstalled = commandExists('github-markup')
    this.timeout(30000)

    if (!gitHubMarkupInstalled) {
      it.skip('tests github markup functionality', () => {})
    } else {
      it('should render a markdown file', async () => {
        const res = await GitHubMarkup.renderMarkup(
          `${__dirname}/MarkdownForTest.md`
        )
        expect(res).to.contain('Some text')
      })

      it('should render an rst file', async () => {
        const res = await GitHubMarkup.renderMarkup(
          `${__dirname}/rst_for_test.rst`
        )
        expect(res).to.contain(
          'https://opensource.newrelic.com/oss-category/#community-plus'
        )
      })

      it('should fail to render a non-markup file', async () => {
        const res = await GitHubMarkup.renderMarkup(
          `${__dirname}/image_for_test.png`
        )
        expect(res).to.equal(null)
      })

      it("should fail to render a file that doesn't exist", async () => {
        const res = await GitHubMarkup.renderMarkup(`${__dirname}/not_a_file`)
        expect(res).to.equal(null)
      })
    }
  })
})
