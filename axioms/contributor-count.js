const gitlog = require('gitlog').default

module.exports = function (fileSystem) {
  const commits = gitlog({
    repo: fileSystem.targetDir,
    all: true,
    number: 10000 // Fetch the last 10000 commits
  })
  if (!commits) {
    return 0
  }
  // Get commit authors and filter unique values
  const contributors = commits
    .map((commit) => commit.authorName.toLowerCase())
    .filter((value, index, self) => self.indexOf(value) === index)
  return contributors.length
}
