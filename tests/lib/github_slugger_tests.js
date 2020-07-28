// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect

describe('lib', () => {
  describe('github_slugger', () => {
    const slugger = require('../../lib/github_slugger')

    it('slugs a heading', () => {
      expect(slugger.slug('# this is a header')).to.equal('-this-is-a-header')
    })

    it('strips uppercase and formatting', () => {
      expect(slugger.slug('# `this is A heaD"er')).to.equal('-this-is-a-header')
    })

    it('removes common emojis', () => {
      expect(slugger.slug('❗❌⚠️✅ℹ️ heading')).to.equal('-heading')
    })

    it('fixed test issue', () => {
      expect(slugger.slug('✅ `myrule`')).to.equal('-myrule')
    })
  })
})
