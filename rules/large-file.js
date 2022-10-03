const nodefs = require('fs')
// eslint-disable-next-line no-unused-vars
const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const path = require('path')
/**
 * Check if a list of files' size on the file system that is larger than provided size.
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @param {boolean} not Whether or not to invert the result (not contents instead of contents)
 * @returns {Promise<Result>} The lint rule result
 */
async function largeFile(fs, options, not = false) {
  // support legacy configuration keys
  const fileList = options.globsAll || options.files
  const files = await fs.findAllFiles(fileList, !!options.nocase)

  if (files.length === 0) {
    return new Result(
      'Did not find file matching the specified patterns',
      fileList.map(f => {
        return { passed: false, pattern: f }
      }),
      !options['fail-on-non-existent']
    )
  }

  const results = (
    await Promise.all(
      files.map(async file => {
        const filePath = path.resolve(fs.targetDir, file)
        const stat = await nodefs.promises.stat(filePath)
        const passed = stat.size <= options.size
        const readerFriendlySize =
          stat.size > 1000 * 1000
            ? `${stat.size / 1000000} MB`
            : `${stat.size / 1000} KB`
        const message = `File size ${readerFriendlySize} bytes`

        return {
          passed: not ? !passed : passed,
          path: filePath,
          message,
          size: stat.size
        }
      })
    )
  )
    .filter(fileStat => {
      return !fileStat.passed
    })
    .sort((stat1, stat2) => {
      return stat2.size - stat1.size
    })

  const filteredResults = results.filter(r => r !== null)
  const passed = !filteredResults.find(r => !r.passed)
  if (passed.length === 0 || passed) {
    return new Result(
      `No file larger than ${options.size} bytes found.`,
      filteredResults,
      passed
    )
  }
  return new Result('Large file(s) found:', filteredResults, passed)
}

module.exports = largeFile
