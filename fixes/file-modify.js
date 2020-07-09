const Result = require('../lib/result')
const FileSystem = require ('../lib/file_system')
/** @type {any} */
const fetch = require('node-fetch')

// TODO: Dry run?
// TODO: only run on rule failed targets

/**
 * Prepend or append text to a file
 * 
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @param {string[]} targets The files to modify (will be overridden by options if present)
 * @param {boolean} dryRun If true, repolinter will report suggested fixes, but will make no disk modifications.
 * @returns {Promise<Result>} The lint rule result
 */
async function fileModify(fs, options, targets, dryRun = false) {
  const realTargets = options.files || targets
  if (realTargets.length === 0)
    return new Result(`No files to modify, did you configure this fix correctly?`, [], false)

  // find all files matching the regular expressions specified
  let files = fs.findAllFiles(realTargets, options.nocase === true)

  // skip files if necessary
  if (options['skip-paths-matching']) {
    let regexes = []
    const extensions = options['skip-paths-matching'].extensions
    if (extensions && extensions.length > 0) {
      const extJoined = extensions.join('|')
      // \.(svg|png|exe)$
      regexes.push(new RegExp('\.(' + extJoined + ')$', 'i')) // eslint-disable-line no-useless-escape
    }
    
    const patterns = options['skip-paths-matching'].patterns
    if (patterns && patterns.length > 0) {
      const filteredPatterns = patterns
        .filter(p => typeof p === 'string' && p !== '')
        .map(p => new RegExp(p, options['skip-paths-matching'].flags))
      regexes = regexes.concat(filteredPatterns)
    }
    files = files.filter(file =>
      !regexes.some(regex => file.match(regex))
    )
  }

  // read the text from the source, if necessary
  let content;        
  if (typeof options.text === 'string')
    content = options.text
  else if (typeof options.text === 'object') {
    if (options.text.url) {
      let req = await fetch(options.text.url)
      if (!req.ok)
        return new Result(`Could not fetch from ${options.text.url}, received status code ${req.status}`, [], false)
      content = await req.text()
    }
    else if (options.text.file) {
      let file = fs.findFirstFile([options.text.file], options.text.nocase === true)
      if (!file)
        return new Result(`Could not find file matching pattern ${ options.text.file } for file-modify.`, [], false)
      content = fs.getFileContents(file)
    }
  }
  if (!content)
    return new Result(`Text was not specified for file-modify! Did you configure the ruleset correctly?`, [], false)

  // write it to the file
  let resTargets = files.map(file => {
    // do file operation
    if (!dryRun) {
      if (options.write_mode === 'append')
        fs.setFileContents(file, fs.getFileContents(file) + content)
      else
        fs.setFileContents(file, content + fs.getFileContents(file))
    }
    // return the target information
    const message = typeof options.text === 'object'
      ? `${options.write_mode} text from ${options.text.file || options.text.url} to file`
      : `${options.write_mode} "${content}" to file`
    return {
      message,
      passed: true,
      path: file,
    }
  })
    
  return new Result('', resTargets, true)
}

module.exports = fileModify