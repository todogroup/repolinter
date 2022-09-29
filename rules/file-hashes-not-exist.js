const Result = require('../lib/result')
const crypto = require('crypto')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')

/**
 * Check files not include a list of certain cryptographic hashes.
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @returns {Promise<Result>} The lint rule result
 */
async function fileHashesNotExist(fs, options) {
  const fileList = options.globsAll || options.files
  const files = await fs.findAllFiles(fileList, !!options.nocase)

  if (files.length === 0) {
    return new Result(
      'Did not find any file matching the specified patterns',
      fileList.map(f => {
        return { passed: false, pattern: f }
      }),
      true
    )
  }

  const algorithm = options.algorithm || 'sha256'

  const resultsList = await Promise.all(
    options.hashes.map(async hash => {
      const singleHashResults = (
        await Promise.all(
          files.map(async file => {
            const digester = crypto.createHash(algorithm)
            let fileContents = await fs.getFileContents(file)
            if (fileContents === undefined) {
              fileContents = ''
            }
            digester.update(fileContents)
            const fileHash = digester.digest('hex')
            const passed = fileHash !== hash
            const message = passed ? "Doesn't Matches hash" : 'Match hash'

            return {
              passed,
              path: file,
              message
            }
          })
        )
      ).filter(result => !result.passed)
      return singleHashResults
    })
  )

  const results = []
  resultsList.map(singleHashResults => {
    for (const result of singleHashResults) {
      results.push(result)
    }
  })

  const passed = results.length === 0

  if (passed) {
    return new Result('No file matching hash found', results, passed)
  }
  return new Result('File matching has found', results, passed)
}

module.exports = fileHashesNotExist
