const Result = require('../lib/result')
const request = require('sync-request')

const WRITE_MODES = ["prepend", "append"]

const DEFAULT_CONFIG = {
    write_mode: "append",
    nocase: false,
    "skip-paths-matching": null,   
}

function errorResult(msg, fix, target = null) {
    return [new Result(fix, msg, target, false)]
}

// TODO: Dry run?
// TODO: only run on rule failed targets

module.exports = function (fileSystem, fix, ruleResult, dryRun = false) {
    const options = fix.options
    const fs = options.fs || fileSystem;
    const targets = options.files || ruleResult.target;

    if (!targets)
        return errorResult(`A target file was not specified for file-modify! Did you configure the ruleset correctly?`, fix)

    // find all files matching the regular expressions specified
    let files = fs.findAllFiles(targets, options.nocase === true)

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
            let req = request('GET', options.text.url).getBody()
            if (req.statusCode >= 300)
                return errorResult(`Request to ${ options.text.url } for file-modify failed with status code ${ req.statusCode }.`, fix, targets)
            content = req.body;

            // TODO: print info?
        }
        else if (options.text.file) {
            let file = fs.findFirstFile([options.text.file], options.text.nocase === true)
            if (!file)
                return errorResult(`Could not find file matching pattern ${ options.text.file } for file-modify.`, fix, targets)
            content = fs.getFileContents(file)

            // TODO: print info?
        }
    }
    if (!content)
        return errorResult(`Text was not specified for file-modify! Did you configure the ruleset correctly?`, fix, targets)

    // write it to the file
    // TODO: Print that we are doing X during dry run
    for (const file of files) {
        if (options.write_mode === 'append')
            fs.setFileContents(file, fs.getFileContents(file) + content)
        else
            fs.setFileContents(file, content + fs.getFileContents(file))
    }

    return files.map((f) => new Result(fix, `Successfully completed ${ options.write_mode } on ${ f }`, f, true));
}
