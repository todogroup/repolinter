// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

class JsonFormatter {
  format (result) {
    return JSON.stringify(result)
  }
}

module.exports = new JsonFormatter()
