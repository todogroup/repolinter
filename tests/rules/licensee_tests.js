// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const FileSystem = require('../../lib/file_system')
const commandExists = require('command-exists').sync

describe('rule', () => {
  describe('licensee', () => {
    const licenseeInstalled = commandExists('licensee')
    const licenseDetectable = require('../../rules/license-detectable-by-licensee')
    const targetDir = `${__dirname}/licensee_test_files`

    if (!licenseeInstalled)
      it.skip('tests license-detectable-by-licensee functionality', () => {})
    else {
      it('rule fails if no license is detectable', async () => {
        const testFs = new FileSystem(`${targetDir}/no-license`)

        const actual = await licenseDetectable(testFs)
        expect(actual.passed).to.equal(false)
        expect(actual.message).to.equal(
          'Licensee did not identify a license for project'
        )
      })

      it('rule passes if license is detectable, but unknown', async () => {
        const testFs = new FileSystem(`${targetDir}/unknown-license`)

        const actual = await licenseDetectable(testFs)
        expect(actual.passed).to.equal(true)
        expect(actual.message).to.equal(
          'Licensee identified the license for project: NOASSERTION'
        )
      })

      it('rule passes if license is detectable and recognized', async () => {
        const testFs = new FileSystem(`${targetDir}/0bsd`)

        const actual = await licenseDetectable(testFs)
        expect(actual.passed).to.equal(true)
        expect(actual.message).to.equal(
          'Licensee identified the license for project: 0BSD'
        )
      })
    }
  })
})
