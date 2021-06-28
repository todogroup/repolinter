// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const expect = chai.expect
const path = require('path')
const fs = require('fs')
const ServerMock = require('mock-http-server')

chai.use(chaiAsPromised)

describe('lib', () => {
  describe('config', function () {
    const Config = require('../../lib/config')

    this.timeout(10000)

    describe('isAbsoluteURL', () => {
      it('should identify absolute URLs', async () => {
        expect(Config.isAbsoluteURL('http://example.com/')).to.equals(true)
        expect(Config.isAbsoluteURL('https://example.com/')).to.equals(true)
        expect(Config.isAbsoluteURL('ftp://example.com/')).to.equals(true)
      })

      it('should identify relative URLs', async () => {
        expect(Config.isAbsoluteURL('foo')).to.equals(false)
        expect(Config.isAbsoluteURL('/foo')).to.equals(false)
        expect(Config.isAbsoluteURL('file:/foo')).to.equals(false)
        expect(Config.isAbsoluteURL('file:///foo')).to.equals(false)
        expect(Config.isAbsoluteURL('c:\\foo')).to.equals(false)
      })
    })

    describe('findConfig', () => {
      it('should find config file in directory', async () => {
        const localConfig = path.join(__dirname, 'repolinter.yaml')
        expect(Config.findConfig(__dirname)).to.equals(localConfig)
      })
      it('should return default file when no config present', async () => {
        const parent = path.join(__dirname, '..')
        const defaultConfig = path.join(
          __dirname,
          '../../rulesets/default.json'
        )
        expect(Config.findConfig(parent)).to.equals(defaultConfig)
      })
    })

    describe('loadConfig', async () => {
      const server = new ServerMock({ host: 'localhost', port: 9000 }, {})
      const serveDirectory = dir => ({
        method: 'GET',
        path: '*',
        reply: {
          status: 200,
          body: request =>
            fs.readFileSync(path.resolve(dir, request.pathname.substring(1)))
        }
      })
      beforeEach(done => server.start(done))
      afterEach(done => server.stop(done))

      it('should load local config file', async () => {
        const actual = await Config.loadConfig(
          path.join(__dirname, 'default.json')
        )
        expect(actual.rules).to.have.property('test-file-exists')
        expect(actual.rules['test-file-exists'].level).to.equals('error')
      })

      it('should load URL config file', async () => {
        server.on(serveDirectory(__dirname))
        const actual = await Config.loadConfig(
          'http://localhost:9000/default.json'
        )
        expect(actual.rules).to.have.property('test-file-exists')
        expect(actual.rules['test-file-exists'].level).to.equals('error')
      })

      it('should handle relative file extends', async () => {
        const actual = await Config.loadConfig(
          path.join(__dirname, 'repolinter.yaml')
        )
        expect(actual.rules).to.have.property('test-file-exists')
        expect(actual.rules['test-file-exists'].level).to.equals('error')
      })

      it('should handle relative URL extends', async () => {
        server.on(serveDirectory(__dirname))
        const actual = await Config.loadConfig(
          'http://localhost:9000/repolinter.yaml'
        )
        expect(actual.rules).to.have.property('test-file-exists')
        expect(actual.rules['test-file-exists'].level).to.equals('error')
      })

      it('should handle absolute URL extends', async () => {
        server.on(serveDirectory(__dirname))
        const actual = await Config.loadConfig(
          path.join(__dirname, 'absolute-override.yaml')
        )
        expect(actual.rules).to.have.property('test-file-exists')
        expect(actual.rules['test-file-exists'].level).to.equals('off')
      })

      it('should detect loops in extended rulesets', async () => {
        const loopSelf = await Config.loadConfig(
          path.join(__dirname, 'loop-self.yaml')
        )
        expect(loopSelf.rules).to.have.property('test-file-exists')
        expect(loopSelf.rules['test-file-exists'].level).to.equals('error')

        const loopB = await Config.loadConfig(
          path.join(__dirname, 'loop-b.yaml')
        )
        expect(loopB.rules).to.have.property('test-file-exists')
        expect(loopB.rules['test-file-exists'].level).to.equals('off')
      })

      it('should throw error on non existant file', async () => {
        expect(Config.loadConfig('/does-not-exist')).to.eventually.throw(
          'ENOENT'
        )
      })

      it('should throw error on non existant URL', async () => {
        server.on(serveDirectory(__dirname))
        expect(
          Config.loadConfig('http://localhost:9000/404')
        ).to.eventually.throw('404')
      })
    })

    describe('validateConfig', () => {
      // already tested as part of the repolinter api tests in tests/api
    })

    describe('parseConfig', () => {
      // already tested as part of the repolinter api tests in tests/api
    })
  })
})
