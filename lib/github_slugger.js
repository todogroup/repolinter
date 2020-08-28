// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const whitespace = /\s/g
const specials = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~’]/g
const emojiRegex = require('emoji-regex')

/**
 * A github markdown header slugger, based on the following fork of github-slugger: https://github.com/Flet/github-slugger/tree/25cdb15768737d7c1e5218d06d34a772faaf5851
 * Parse a unicode string into a markdown anchor link using a GitHub-flavored algorithm.
 *
 * @protected
 * @param {string} string The heading to parse.
 * @returns {string} The slug to use in URLs.
 */
function slug (string) {
  if (typeof string !== 'string') return ''

  return string
    .toLowerCase()
    .trim()
    .replace(specials, '')
    .replace(emojiRegex(), '')
    .replace(whitespace, '-')
}

module.exports.slug = slug
