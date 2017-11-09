// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

class JsonFormatter {
  format (rule, message, level) {
    let output = {
      rule: rule.id,
      message: message,
      level: level
    }

    return JSON.stringify(output)
  }
}

module.exports = new JsonFormatter()
