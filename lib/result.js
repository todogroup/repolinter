// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const symbolFormatter = require('../formatters/symbol_formatter')
const jsonFormatter = require('../formatters/json_formatter')

class Result {
  constructor (rule, message, target, passed) {
    this.rule = rule
    this.message = message
    this.target = target
    this.passed = passed
  }

  toString () {
    return symbolFormatter.format(this)
  }

  toJson () {
    return jsonFormatter.format(this)
  }

  getStatus () {
    if (this.passed) {
      return 'success'
    } else {
      return this.rule.level
    }
  }
}

module.exports = Result
