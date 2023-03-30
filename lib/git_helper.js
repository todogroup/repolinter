const spawnSync = require('child_process').spawnSync

/**
 * @param targetDir
 * @ignore
 */
function gitAllCommits(targetDir) {
  const args = ['-C', targetDir, 'rev-list', '--all']
  return spawnSync('git', args).stdout.toString().split('\n')
}

module.exports = {
  gitAllCommits
}
