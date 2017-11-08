// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const logSymbols = require('log-symbols')

class SymbolFormatter {
  format (rule, message, level) {
    return `${logSymbols[level]} ${rule.id}: ${message}`
  }
}

module.exports = new SymbolFormatter()
