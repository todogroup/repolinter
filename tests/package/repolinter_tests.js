// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const path = require('path')
const chai = require('chai')
const sinon = require('sinon')
const expect = chai.expect
const repolinter = require(path.resolve('.'))

describe('package', () => {
  describe('repolinter', () => {
    it('allows a custom formatter', () => {
      let customFormatter = {}
      customFormatter.format = sinon.spy()
      repolinter.resultFormatter = customFormatter

      let log = console.log
      console.log = function () { return null }

      repolinter.lint(path.resolve('tests/package'))
      expect(customFormatter.format.called).to.equal(true)

      console.log = log
    })
  })
})
