// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const path = require('path')
const chai = require('chai')
const expect = chai.expect

describe('packagers', () => {
  const packagers = require('../../axioms/packagers')
  const FileSystem = require('../../lib/file_system')

  it('repolinter is only npm', async () => {
    const fileSystem = new FileSystem(path.resolve('.'))

    const expected = ['npm']

    const actual = await packagers(fileSystem)
    expect(actual).to.deep.equal(expected)
  })
})
