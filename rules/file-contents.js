// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line no-unused-vars
const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')

function getContent(options) {
  return options['human-readable-content'] !== undefined
    ? options['human-readable-content']
    : options.content
}

/**
 * Check if a list of files contains a regular expression.
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @param {boolean} not Whether or not to invert the result (not contents instead of contents)
 * @returns {Promise<Result>} The lint rule result
 */
async function fileContents(fs, options, not = false) {
  // support legacy configuration keys
  const fileList = options.globsAll || options.files
  const files = await fs.findAllFiles(fileList, !!options.nocase)

  if (files.length === 0) {
    return new Result(
      'Did not find file matching the specified patterns',
      fileList.map(f => {
        return { passed: !options['fail-on-non-existent'], pattern: f }
      }),
      !options['fail-on-non-existent']
    )
  }

  const regexp = new RegExp(options.content, options.flags)
  let results

  if (!options['display-result-context']) {
    /**
     * Default "Contains" / "Doesn't contain"
     */
    results = await Promise.all(
      files.map(async file => {
        const fileContents = await fs.getFileContents(file)
        if (!fileContents) return null

        const passed = fileContents.search(regexp) >= 0
        const message = `${
          passed ? 'Contains' : "Doesn't contain"
        } ${getContent(options)}`

        return {
          passed: not ? !passed : passed,
          path: file,
          message
        }
      })
    )
  } else {
    /**
     * Add regular expression matched content context into result.
     * Added contexts includes:
     *  - line # of the regular expression.
     *  - 'options.context-char-length' number of characters before and after the regex match.
     * The added context will be in result.message.
     *
     * Note: if 'g' is not presented in 'options.flags',
     * the regular expression will only display the first match context.
     */
    results = (
      await Promise.all(
        files.map(async file => {
          const fileContents = await fs.getFileContents(file)
          if (!fileContents) return null

          const optionContextCharLength = options['context-char-length'] || 50
          const split = fileContents.split(regexp)
          const passed = split.length > 1
          const fileLines = fileContents.split('\n')
          const contextLines = split
            /**
             * @return sum of line numbers in each regexp split chunks.
             */
            .map(fileChunk => {
              return fileChunk.split('\n').length
            })
            /**
             * Get lines of regexp match
             * @return list of lines contains regexp matchs
             */
            .reduce((previous, current, index, array) => {
              /**
               * Push number of lines before the first regex match to the result array.
               */
              if (previous.length === 0) {
                previous.push(current)
              } else if (current === 1 || index === array.length - 1) {
                /**
                 * We don't need to count multiple times if one line contains multiple regexp match.
                 * We don't need to count rest of lines after last regexp match.
                 */
              } else {
                /**
                 * Add *relative number of lines* between this regex match and last regex match (current-1)
                 * to the last *absolute number of lines* of last regex match to the top of file (previous[lastElement])
                 * to get the *absolute number of lines* of current regex match.
                 */
                previous.push(current - 1 + previous[previous.length - 1])
              }
              return previous
            }, [])
            /**
             * @return lines and contexts of every regexp match.
             */
            .reduce((previous, current) => {
              const matchedLine = fileLines[current - 1]
              let currentMatch
              while ((currentMatch = regexp.exec(matchedLine)) !== null) {
                const matchStart = currentMatch.index
                const contextStart =
                  matchStart - optionContextCharLength > 0
                    ? matchStart - optionContextCharLength
                    : 0
                const contextEnd = Math.min(
                  currentMatch.index +
                    currentMatch[0].length +
                    optionContextCharLength,
                  matchedLine.length
                )
                previous.push({
                  line: current,
                  context: matchedLine.substring(contextStart, contextEnd)
                })
              }
              return previous
            }, [])
          const message = `${
            passed ? 'Contains' : "Doesn't contain"
          } '${getContent(options)}'`

          return {
            passed: not ? !passed : passed,
            path: file,
            contextLines,
            message
          }
        })
      )
    )
      .filter(result => result && (not ? !result.passed : result.passed))
      .reduce((previous, current) => {
        current.contextLines.forEach(lineContext => {
          previous.push({
            passed: current.passed,
            path: current.path,
            message: `${current.message} on line ${lineContext.line}, context: \n\t|${lineContext.context}`
          })
        })
        return previous
      }, [])
  }

  const filteredResults = results.filter(r => r !== null)
  const passed = !filteredResults.find(r => !r.passed)
  return new Result('', filteredResults, passed)
}

module.exports = fileContents
