// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const logSymbols = require('log-symbols')

class SymbolFormatter {
  format (result) {
    return `${logSymbols[result.getStatus()]} ${result.rule.id}: ${result.message}`
  }
}

module.exports = new SymbolFormatter()
