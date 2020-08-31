const chai = require('chai')
const expect = chai.expect
const path = require('path')
const FileSystem = require('../../lib/file_system')
const contributors = require('../../axioms/contributor-count')

describe('contributors axiom', () => {
  it('repolinter contributor count greater than zero', async () => {
    const fs = new FileSystem(path.resolve('.'))
    const contributorCount = await contributors(fs)
    expect(contributorCount.passed).to.equal(true)
    expect(contributorCount.targets).to.have.length(1)
    expect(parseInt(contributorCount.targets[0].path)).to.be.greaterThan(0)
  })
})
