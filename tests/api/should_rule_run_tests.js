// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const { shouldRuleRun } = require('../..')
const expect = chai.expect

describe('api', () => {
  describe('validateConfig', () => {
    it('should allow a rule to run if axioms match', () => {
      const res = shouldRuleRun(['language=javascript', 'language=*'], ['language=javascript'])
      expect(res).to.deep.equal([])
    })

    it('should allow a rule to run if axioms wildcard match', () => {
      const res = shouldRuleRun(['language=javascript', 'language=*'], ['language=*'])
      expect(res).to.deep.equal([])
    })

    it('should not allow a rule to run if no axioms match', () => {
      const res = shouldRuleRun(['language=javascript', 'language=*'], ['language=cheese'])
      expect(res).to.deep.equal(['language=cheese'])
    })

    it('should not allow non-numerical axioms with numerical comparisons', () => {
      const res = shouldRuleRun(['language=javascript', 'language=*'], ['language>=3'])
      expect(res).to.deep.equal(['language>=3'])
    })

    it('should not allow invalid operators', () => {
      const res = shouldRuleRun(['language=3', 'language=*'], ['language=>3'])
      expect(res).to.deep.equal(['language=>3'])
    })

    it('should handle a mix of axoims', () => {
      const resPass = shouldRuleRun(['commits=hello', 'commits=*', 'contributor-count=blah', 'contributors=*'], ['commits=hello', 'contributor-count=blah'])
      expect(resPass).to.deep.equal([])
      const resFail = shouldRuleRun(['commits=hello', 'commits=*', 'contributor-count=blah', 'contributors=*'], ['commits=nothello', 'contributor-count=blah'])
      expect(resFail).to.deep.equal(['commits=nothello'])
    })

    it('should handle a numerical = axiom', () => {
      const res = shouldRuleRun(['language=javascript', 'language=*', 'contributors=7', 'contributors=*'], ['contributors=7'])
      expect(res).to.deep.equal([])
    })

    it('should handle a numerical > axiom', () => {
      const resPass = shouldRuleRun(['language=javascript', 'language=*', 'contributors=7', 'contributors=*'], ['contributors>6'])
      expect(resPass).to.deep.equal([])
      const resFail = shouldRuleRun(['language=javascript', 'language=*', 'contributors=7', 'contributors=*'], ['contributors>7'])
      expect(resFail).to.deep.equal(['contributors>7'])
    })

    it('should handle a numerical >= axiom', () => {
      const resPass = shouldRuleRun(['language=javascript', 'language=*', 'contributors=7', 'contributors=*'], ['contributors>=7'])
      expect(resPass).to.deep.equal([])
      const resFail = shouldRuleRun(['language=javascript', 'language=*', 'contributors=7', 'contributors=*'], ['contributors>=8'])
      expect(resFail).to.deep.equal(['contributors>=8'])
    })

    it('should handle a numerical < axiom', () => {
      const resPass = shouldRuleRun(['language=javascript', 'language=*', 'contributors=7', 'contributors=*'], ['contributors<8'])
      expect(resPass).to.deep.equal([])
      const resFail = shouldRuleRun(['language=javascript', 'language=*', 'contributors=7', 'contributors=*'], ['contributors<7'])
      expect(resFail).to.deep.equal(['contributors<7'])
    })

    it('should handle a numerical <= axiom', () => {
      const resPass = shouldRuleRun(['language=javascript', 'language=*', 'contributors=7', 'contributors=*'], ['contributors<=7'])
      expect(resPass).to.deep.equal([])
      const resFail = shouldRuleRun(['language=javascript', 'language=*', 'contributors=7', 'contributors=*'], ['contributors<=6'])
      expect(resFail).to.deep.equal(['contributors<=6'])
    })

    it('should handle a mix of numerical axoims', () => {
      const resPass = shouldRuleRun(['commits=700', 'commits=*', 'contributors=7', 'contributors=*'], ['contributors<=7', 'contributors>4', 'commits>500'])
      expect(resPass).to.deep.equal([])
      const resFail = shouldRuleRun(['commits=700', 'commits=*', 'contributors=7', 'contributors=*'], ['contributors<=6', 'contributors>4', 'commits>900'])
      expect(resFail).to.deep.equal(['contributors<=6', 'commits>900'])
    })

    it('should handle both numerical and regular axioms', () => {
      const resPass = shouldRuleRun([
        'commits=700',
        'commits=*',
        'contributors=7',
        'contributors=*',
        'language=javascript',
        'language=*',
        'git=yes',
        'git=*'
      ],
      [
        'contributors<=7',
        'contributors>4',
        'commits>600',
        'git=*'
      ])
      expect(resPass).to.deep.equal([])
      const resFail = shouldRuleRun([
        'commits=700',
        'commits=*',
        'contributors=7',
        'contributors=*',
        'language=javascript',
        'language=*',
        'git=yes',
        'git=*'
      ],
      [
        'contributors<=7',
        'contributors>4',
        'commits>900',
        'git=no'
      ])
      expect(resFail).to.deep.equal(['commits>900', 'git=no'])
    })
  })
})
