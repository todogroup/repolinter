const spawnSync = require('child_process').spawnSync;

class Linguist {

  /**
   * Returns the languages found in the project. 
   * Associate Array of language String to Array of filenames that are written in that language
   *
   * Throws 'Linguist not installed' error if command line of 'linguist' is not available. 
   */
  identify_languages(targetDir) {
    const linguistOutput = spawnSync('linguist', [targetDir, '--json']).stdout;
    if(linguistOutput == null) {
      throw 'Linguist not installed';
    }
    const json=linguistOutput.toString();
    return JSON.parse(json);
  }
}

module.exports = new Linguist();
