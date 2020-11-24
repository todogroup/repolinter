// Copyright 2018 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const { commandExists } = require('./command_exists')
const spawnSync = require('child_process').spawnSync

class GitHubMarkup {
  /**
   * Returns a rendered version of a given README file, or null if the document
   * cannot be rendered. Supports all formats used by github_markup.
   *
   * Throws 'GitHub Markup not installed' error if command line of 'github_markup' is not available.
   *
   * @param {string} targetFile The file to render
   * @returns {Promise<string|null>} The rendered markup, or null if it cannot be rendered
   */
  async renderMarkup(targetFile) {
    // TODO: windows?
    const command = await commandExists(['github-markup'])
    if (command === null) {
      throw new Error('GitHub markup not installed')
    }
    const gitHubMarkupRes = spawnSync(
      `${__dirname}/github_markup_check_and_render`,
      [targetFile]
    )
    if (gitHubMarkupRes.status !== 0) {
      return null
    }
    return gitHubMarkupRes.stdout.toString()
  }
}

module.exports = new GitHubMarkup()
