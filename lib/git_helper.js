const spawnSync = require('child_process').spawnSync

/**
 * @param targetDir
 * @ignore
 */
function gitAllCommits(targetDir) {
  const args = ['-C', targetDir, 'rev-list', '--all']
  return spawnSync('git', args).stdout.toString().split('\n')
}

/**
 * @param targetDir
 * @ignore
 */
function gitAllTagNames(targetDir) {
  const args = ['-C', targetDir, 'tag', '-l']
  const tagNames = spawnSync('git', args).stdout.toString().split('\n')
  tagNames.pop()
  return tagNames
}

module.exports = {
  gitAllCommits,
  gitAllTagNames
}
