// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const chai = require('chai')
const expect = chai.expect

describe('formatters', () => {
  describe('json_formatter', () => {
    it('returns a json string with the correct info', () => {
      const jsonFormatter = require('../../formatters/json_formatter')
      const rule = {id: 'some-rule'}

      const successResult = jsonFormatter.format(rule, 'a message', 'success')
      expect(successResult).to.deep.equal(`{"rule":"some-rule","message":"a message","level":"success"}`)

      const errorResult = jsonFormatter.format(rule, 'a message', 'error')
      expect(errorResult).to.deep.equal(`{"rule":"some-rule","message":"a message","level":"error"}`)
    })
  })
})
