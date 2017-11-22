// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const logSymbols = require('log-symbols')

class SymbolFormatter {
  format (result) {
    return `${logSymbols[result.getStatus()]} ${result.rule.id}: ${result.message}`
  }
}

module.exports = new SymbolFormatter()
