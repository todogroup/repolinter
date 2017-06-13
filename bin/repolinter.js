#!/usr/bin/env node

const path = require('path');

const repolinter = require('..');

repolinter(path.resolve(process.cwd(), process.argv[2] || '.'));
