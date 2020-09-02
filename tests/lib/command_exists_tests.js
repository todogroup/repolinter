// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const { commandExists } = require('../../lib/command_exists')

describe('lib', () => {
  describe('command_exists', function () {
    it('should detect a command exists', async () => {
      const res = await commandExists('ssh')
      expect(res).to.equal('ssh')
    })

    it('should detect a command doesn\'t exists', async () => {
      const res = await commandExists('notacommand')
      expect(res).to.equal(null)
    })

    it('should detect one of the commands exist', async () => {
      const res = await commandExists(['notacommand', 'ssh'])
      expect(res).to.equal('ssh')
    })

    it('should detect none of the commands exist', async () => {
      const res = await commandExists(['notacommand', 'alsonotacommand'])
      expect(res).to.equal(null)
    })

    it('should detect the first command exists', async () => {
      const res = await commandExists(['ssh', 'ln'])
      expect(res).to.equal('ssh')
    })
  })
})
