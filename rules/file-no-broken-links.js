// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const { HtmlChecker } = require('broken-link-checker')
const path = require('path')
const { URL } = require('url')
const GitHubMarkup = require('../lib/github_markup')
const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')

/**
 * Searches for a renderable markup document, renders it, and then
 * checks for broken links by scanning the html.
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @returns {Promise<Result>} The lint rule result
 */
async function fileNoBrokenLinks(fs, options) {
  const files = await fs.findAllFiles(options.globsAll, !!options.nocase)

  if (files.length === 0) {
    return new Result(
      'Did not find file matching the specified patterns',
      options.globsAll.map(f => {
        return { passed: false, pattern: f }
      }),
      !!options['succeed-on-non-existent']
    )
  }

  // for every file check every broken link
  const results = await Promise.all(
    files.map(async f => {
      // render it, if possible
      const absMdPath = path.posix.resolve(fs.targetDir, f)
      const rendered = await GitHubMarkup.renderMarkup(absMdPath)
      if (rendered === null) {
        return {
          passed: true,
          path: f,
          message: 'Ignored due to unknown file format.'
        }
      }

      // scan the rendered HTML for broken links
      const linkRes = await new Promise((resolve, reject) => {
        const linkBuf = []
        const htmlChecker = new HtmlChecker(
          {
            ...options,
            excludedKeywords: ['#*'] // exclude local section links
          },
          {
            link: res => linkBuf.push(res),
            complete: () => resolve(linkBuf)
          }
        )

        const didScan = htmlChecker.scan(
          rendered,
          new URL(`file://${path.posix.join(fs.targetDir, f)}`)
        )
        if (!didScan)
          reject(Error('Failed to scan HTML with broken link checker'))
      })

      // find all relative links, and double check the filesystem for their existence
      // filter down to broken links
      const brokenLinks = linkRes.filter(link => link.broken)
      // split into invalid and otherwise failing
      const { failing, invalid } = brokenLinks.reduce(
        (res, linkRes) => {
          linkRes.brokenReason === 'BLC_INVALID'
            ? res.invalid.push(linkRes)
            : res.failing.push(linkRes)
          return res
        },
        { failing: [], invalid: [] }
      )
      // make the messages for the failing URLs
      const failingMessages = failing.map(
        ({ brokenReason, url: { original }, http: { response } }) =>
          `\`${original}\` (${
            brokenReason.includes('HTTP')
              ? `status code ${response && response.status}`
              : `unknown error ${brokenReason}`
          })`
      )
      // process the invalid links to check if they're actually filesystem paths
      // returning the message for invalid URLs
      const failingInvalidMessagesWithNulls = await Promise.all(
        invalid.map(async b => {
          const originalURL = b.url.original
          const baseURL = b.base.resolved
          let url
          // parse the URL, and if it fails to parse it's invalid
          try {
            url = new URL(originalURL, baseURL)
            if (url.protocol !== 'file:' || !url.pathname)
              return `\`${originalURL}\` (invalid URL)`
          } catch (e) {
            return `\`${originalURL}\` (invalid path)`
          }
          // verify the path is relative, else the path is invalid
          if (path.posix.isAbsolute(originalURL))
            return `\`${originalURL}\` (invalid path)`
          // verify the path doesn't traverse outside the project, else the path is excluded
          const targetDir = path.posix.resolve(fs.targetDir)
          const filePath = path.posix.join('/', url.host, url.pathname)
          const absPath = path.posix.resolve(targetDir, filePath)
          const relPath = path.posix.relative(targetDir, absPath)
          if (relPath.startsWith('..')) {
            if (options['pass-external-relative-links']) return null
            else return `\`${originalURL}\` (relative link outside project)`
          }
          // verify the file exists (or at least that we have access to it)
          if (!(await fs.relativeFileExists(relPath)))
            return `\`${originalURL}\` (file does not exist)`
          return null
        })
      )
      // remove messages which didn't fail
      const failingInvalidMessages = failingInvalidMessagesWithNulls.filter(
        m => m !== null
      )
      // join all the messages together to form the result
      const allMessages = failingInvalidMessages.concat(failingMessages)
      return {
        passed: allMessages.length === 0,
        path: f,
        message:
          allMessages.length === 0
            ? 'All links are valid'
            : allMessages.join(', ')
      }
    })
  )
  // return the final result
  const passed = results.every(({ passed }) => passed)
  return new Result(passed ? '' : 'Found broken links', results, passed)
}

module.exports = fileNoBrokenLinks
