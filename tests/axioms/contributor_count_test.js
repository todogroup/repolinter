const chai = require('chai')
const expect = chai.expect
const path = require('path')
const FileSystem = require('../../lib/file_system')
const contributors = require('../../axioms/contributor-count')
const repolinter = require(path.resolve('.'))

describe('contributors axiom', () => {
  it('repolinter contributor count greater than zero', () => {
    const fs = new FileSystem(path.resolve('.'))
    const contributorCount = contributors(fs)
    expect(contributorCount).to.satisfy((count) => count > 0)
  })

  it('rule enabled because contributor count greater than ten', () => {
    const result = repolinter.lint(path.resolve('tests/package'))
    const { rule } = result
      .map((r) => r[0])
      .find((res) => res.rule.id === 'contributing-file-exists')
    expect(rule.enabled).to.equal(true)
  })
})
