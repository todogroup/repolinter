#!/usr/bin/env node
// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const path = require('path')

const repolinter = require('..')

repolinter(path.resolve(process.cwd(), process.argv[2] || '.'))
