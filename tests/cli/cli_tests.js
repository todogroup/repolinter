// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const path = require('path')
const chai = require('chai')
const cp = require('child_process')
const fs = require('fs')
const ServerMock = require('mock-http-server')
const stripAnsi = require('strip-ansi')
const repolinter = require(path.resolve('.'))
const expect = chai.expect

/**
 * Execute a command in a childprocess asynchronously. Not secure, but good for testing.
 *
 * @param {string} command The command to execute
 * @param {import('child_process').ExecOptions} [opts] Options to execute against.
 * @returns {Promise<{out: string, err: string, code: number}>} The command output
 */
async function execAsync(command, opts = {}) {
  return new Promise((resolve, reject) => {
    cp.exec(command, opts, (err, outstd, errstd) =>
      err !== null && err.code === undefined
        ? reject(err)
        : resolve({
            out: outstd,
            err: errstd,
            code: err !== null ? err.code : 0
          })
    )
  })
}

describe('cli', function () {
  const repolinterPath =
    process.platform === 'win32'
      ? path.resolve('bin/repolinter.bat')
      : path.resolve('bin/repolinter.js')
  const selfPath = path.resolve('tests/cli')
  this.timeout(30000)

  it('runs repolinter from the CLI', async () => {
    const expected = stripAnsi(
      repolinter.defaultFormatter.formatOutput(
        await repolinter.lint(selfPath),
        false
      )
    )
    const actual = await execAsync(`${repolinterPath} lint ${selfPath}`)

    expect(actual.code).to.equal(0)
    expect(actual.out.trim()).to.equals(expected.trim())
  })

  it('produces valid JSON with the JSON formatter', async () => {
    const [actual, actual2] = await Promise.all([
      execAsync(`${repolinterPath} lint ${selfPath} --format json`),
      execAsync(`${repolinterPath} lint ${selfPath} -f json`)
    ])

    expect(actual.code).to.equal(0)
    expect(actual2.code).to.equal(0)
    expect(() => JSON.parse(actual.out)).to.not.throw()
    expect(() => JSON.parse(actual2.out)).to.not.throw()
  })

  it('fixes a problem with dryRun disabled', async () => {
    const actual = await execAsync(
      `${repolinterPath} lint ${selfPath} --rulesetFile repolinter-other-fix.json`
    )

    expect(actual.code).to.not.equal(0)
    const fileExists = await fs.promises
      .access(path.resolve('tests/cli/fixed.txt'))
      .then(() => true)
      .catch(() => false)
    expect(fileExists).to.equal(true)
  })

  it("doesn't make any changes with dryRun enabled", async () => {
    const [actual, actual2] = await Promise.all([
      execAsync(
        `${repolinterPath} lint ${selfPath} -d --rulesetFile repolinter-other-fix.json`
      ),
      execAsync(
        `${repolinterPath} lint ${selfPath} --dryRun --rulesetFile repolinter-other-fix.json`
      )
    ])

    expect(actual.code).to.not.equal(0)
    expect(actual2.code).to.not.equal(0)
    const fileExists = await fs.promises
      .access(path.resolve('tests/cli/fixed.txt'))
      .then(() => true)
      .catch(() => false)
    expect(fileExists).to.equal(false)
  })

  it('runs repolinter from the CLI using a config file', async () => {
    const expected = stripAnsi(
      repolinter.defaultFormatter.formatOutput(
        await repolinter.lint(selfPath, undefined, 'repolinter-other.json'),
        false
      )
    )
    const [actual, actual2, actual3] = await Promise.all([
      execAsync(`${repolinterPath} lint ${selfPath} -r repolinter-other.json`),
      execAsync(
        `${repolinterPath} lint ${selfPath} --rulesetFile repolinter-other.json`
      ),
      execAsync(
        `${repolinterPath} lint ${selfPath} --ruleset-file repolinter-other.json`
      )
    ])

    expect(actual.code).to.equal(0)
    expect(actual2.code).to.equal(0)
    expect(actual3.code).to.equal(0)
    expect(actual.out.trim()).to.equals(expected.trim())
    expect(actual2.out.trim()).to.equals(expected.trim())
    expect(actual3.out.trim()).to.equals(expected.trim())
  })

  it('runs repolinter from the CLI using a YAML config file', async () => {
    const expected = stripAnsi(
      repolinter.defaultFormatter.formatOutput(
        await repolinter.lint(selfPath, undefined, 'repolinter-other.yml'),
        false
      )
    )
    const [actual, actual2, actual3] = await Promise.all([
      execAsync(`${repolinterPath} lint ${selfPath} -r repolinter-other.yml`),
      execAsync(
        `${repolinterPath} lint ${selfPath} --rulesetFile repolinter-other.yml`
      ),
      execAsync(
        `${repolinterPath} lint ${selfPath} --ruleset-file repolinter-other.yml`
      )
    ])

    expect(actual.code).to.equal(0)
    expect(actual2.code).to.equal(0)
    expect(actual3.code).to.equal(0)
    expect(actual.out.trim()).to.equals(expected.trim())
    expect(actual2.out.trim()).to.equals(expected.trim())
    expect(actual3.out.trim()).to.equals(expected.trim())
  })

  it('runs repolinter on a remote git repository', async () => {
    const [actual, actual2] = await Promise.all([
      execAsync(
        `${repolinterPath} lint --git https://github.com/todogroup/repolinter.git`
      ),
      execAsync(
        `${repolinterPath} lint -g https://github.com/todogroup/repolinter.git`
      )
    ])

    expect(actual.code).to.equal(0)
    expect(actual2.code).to.equal(0)
    expect(actual.out.trim()).to.contain('Lint:')
    expect(actual2.out.trim()).to.contain('Lint:')
  })

  it('runs repolinter using a remote ruleset', async () => {
    const server = new ServerMock({ host: 'localhost', port: 9000 }, {})
    await new Promise(resolve => server.start(resolve))
    server.on({
      method: 'GET',
      path: '/repolinter-other.json',
      reply: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: await fs.promises.readFile(
          path.resolve(__dirname, 'repolinter-other.json'),
          'utf-8'
        )
      }
    })

    let expected, actual, actual2, actual3
    try {
      expected = stripAnsi(
        repolinter.defaultFormatter.formatOutput(
          await repolinter.lint(selfPath, [], 'repolinter-other.json'),
          false
        )
      )
      const [act1, act2, act3] = await Promise.all([
        execAsync(
          `${repolinterPath} lint ${selfPath} --rulesetUrl http://localhost:9000/repolinter-other.json`
        ),
        execAsync(
          `${repolinterPath} lint ${selfPath} --ruleset-url http://localhost:9000/repolinter-other.json`
        ),
        execAsync(
          `${repolinterPath} lint ${selfPath} -u http://localhost:9000/repolinter-other.json`
        )
      ])
      actual = act1
      actual2 = act2
      actual3 = act3
    } finally {
      await new Promise(resolve => server.stop(resolve))
    }

    expect(actual.code).to.equal(0)
    expect(actual2.code).to.equal(0)
    expect(actual3.code).to.equal(0)
    expect(actual.out.trim()).to.equals(expected.trim())
    expect(actual2.out.trim()).to.equals(expected.trim())
    expect(actual3.out.trim()).to.equals(expected.trim())
  })

  it('runs repolinter using a remote YAML ruleset', async () => {
    const server = new ServerMock({ host: 'localhost', port: 9000 }, {})
    await new Promise(resolve => server.start(resolve))
    server.on({
      method: 'GET',
      path: '/repolinter-other.yml',
      reply: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: await fs.promises.readFile(
          path.resolve(__dirname, 'repolinter-other.yml'),
          'utf-8'
        )
      }
    })

    let expected, actual, actual2, actual3
    try {
      expected = stripAnsi(
        repolinter.defaultFormatter.formatOutput(
          await repolinter.lint(selfPath, [], 'repolinter-other.yml'),
          false
        )
      )
      const [act1, act2, act3] = await Promise.all([
        execAsync(
          `${repolinterPath} lint ${selfPath} --rulesetUrl http://localhost:9000/repolinter-other.yml`
        ),
        execAsync(
          `${repolinterPath} lint ${selfPath} --ruleset-url http://localhost:9000/repolinter-other.yml`
        ),
        execAsync(
          `${repolinterPath} lint ${selfPath} -u http://localhost:9000/repolinter-other.yml`
        )
      ])
      actual = act1
      actual2 = act2
      actual3 = act3
    } finally {
      await new Promise(resolve => server.stop(resolve))
    }

    expect(actual.code).to.equal(0)
    expect(actual2.code).to.equal(0)
    expect(actual3.code).to.equal(0)
    expect(actual.out.trim()).to.equals(expected.trim())
    expect(actual2.out.trim()).to.equals(expected.trim())
    expect(actual3.out.trim()).to.equals(expected.trim())
  })

  it('runs repolinter using encoded ruleset', async () => {
    const encodedRuleset =
      'ewogICAgIiRzY2hlbWEiOiAiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3BoaWxpcHMtbGFicy9yZXBvbGludGVyL2ZlYXR1cmUvZ2l0aHViLWlzc3VlLWZpeC9ydWxlc2V0cy9zY2hlbWEuanNvbiIsCiAgICAidmVyc2lvbiI6IDIsCiAgICAiYXhpb21zIjogewogICAgICAibGluZ3Vpc3QiOiAibGFuZ3VhZ2UiLAogICAgICAibGljZW5zZWUiOiAibGljZW5zZSIsCiAgICAgICJwYWNrYWdlcnMiOiAicGFja2FnZXIiCiAgICB9LAogICAgInJ1bGVzIjogewogICAgICAibGljZW5zZS1maWxlLWV4aXN0cyI6IHsKICAgICAgICAibGV2ZWwiOiAid2FybmluZyIsCiAgICAgICAgInJ1bGUiOiB7CiAgICAgICAgICAidHlwZSI6ICJmaWxlLWV4aXN0ZW5jZSIsCiAgICAgICAgICAib3B0aW9ucyI6IHsKICAgICAgICAgICAgImdsb2JzQW55IjogWwogICAgICAgICAgICAgICJMSUNFTlNFKiIsCiAgICAgICAgICAgICAgIkNPUFlJTkcqIgogICAgICAgICAgICBdLAogICAgICAgICAgICAibm9jYXNlIjogdHJ1ZQogICAgICAgICAgfQogICAgICAgIH0KICAgICAgfSwKICAgICAgInJlYWRtZS1maWxlLWV4aXN0cyI6IHsKICAgICAgICAibGV2ZWwiOiAid2FybmluZyIsCiAgICAgICAgInJ1bGUiOiB7CiAgICAgICAgICAidHlwZSI6ICJmaWxlLWV4aXN0ZW5jZSIsCiAgICAgICAgICAib3B0aW9ucyI6IHsKICAgICAgICAgICAgImdsb2JzQW55IjogWwogICAgICAgICAgICAgICJSRUFETUUqIgogICAgICAgICAgICBdLAogICAgICAgICAgICAibm9jYXNlIjogdHJ1ZQogICAgICAgICAgfQogICAgICAgIH0sCiAgICAgICAgImZpeCI6IHsKICAgICAgICAgICJ0eXBlIjogImdpdGh1Yi1pc3N1ZS1jcmVhdGUiLAogICAgICAgICAgIm9wdGlvbnMiOiB7CiAgICAgICAgICAgICJpc3N1ZUxhYmVscyI6IFsKICAgICAgICAgICAgICAiY29udGludW91cy1jb21wbGlhbmNlIiwKICAgICAgICAgICAgICAiYXV0b21hdGVkIgogICAgICAgICAgICBdLAogICAgICAgICAgICAiYnlwYXNzTGFiZWwiOiAiQ0M6IEJ5cGFzcyIsCiAgICAgICAgICAgICJpc3N1ZVRpdGxlIjogIkNvbnRpbnVvdXMgQ29tcGxpYW5jZSAtIENyZWF0ZSBhIFJlYWQtbWUg8J+RjSIsCiAgICAgICAgICAgICJpc3N1ZUJvZHkiOiAiSGkgdGhlcmUg8J+RiywgXG4gUGhpbGlwcyB0cmllcyB0byBtYWtlIHN1cmUgdGhhdCByZXBvc2l0b3JpZXMgaW4gdGhpcyBvcmdhbml6YXRpb24gZm9sbG93IGEgY2VydGFpbiBzdGFuZGFyZGl6YXRpb24uIFdoaWxlIHJldmlld2luZyB5b3VyIHJlcG9zaXRvcnksIHdlIGNvdWxkIG5vdCBzdG9wIG91cnNlbHZlcyB0byBmdXJ0aGVyIGltcHJvdmUgdGhpcyByZXBvc2l0b3J5ISBcbiBcbiBBY2NvcmRpbmcgdG8gb3VyIHN0YW5kYXJkcywgd2UgdGhpbmsgdGhlIGZvbGxvd2luZyBjYW4gYmUgaW1wcm92ZWQ6IFxuIC0gQWRkIGEgUmVhZC1tZSBmaWxlIHRvIGV4cGxhaW4gdG8gb3RoZXIgcGVvcGxlIHdoYXQgeW91ciByZXBvc2l0b3J5IGlzIGFib3V0LiBcbiBcbiBQbGVhc2UgcmVmZXIgdG8gdGhlIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24uIFxuXG4iLAogICAgICAgICAgICAiY29tbWVudEJvZHkiOiAiSGV5LCBpdCdzIG1lLCBJIGFtIGJhY2vwn5iOLiBcbiBXZSBub3RpY2VkIHJlZ3Jlc3Npb24gb24gdGhpcyBpc3N1ZSwgc28gd2Ugb3BlbmVkIGFuZCB1cGRhdGVkIGl0LiBcbiBDb3VsZCB5b3UgcGxlYXNlIGhhdmUgYSBsb29rIHRvIHNlZSB3aGF0IGlzIGdvaW5nIG9uPyBcbiBcbiBJZiB5b3Ugd2FudCB0byBieXBhc3MgdGhlIGNoZWNrIGZvciB0aGlzIHJ1bGUsIGF0dGFjaCB0aGUgJ0NDOiBCeXBhc3MnIGxhYmVsLiBcbiBUaGFua3MhIiwKICAgICAgICAgICAgInVuaXF1ZVJ1bGVJZCI6ICI4OTMzYTg5OS0wZmFiLTQyM2MtOTliOS1lZDg4ZDk1OGYxOWQiCiAgICAgICAgICB9CiAgICAgICAgfQogICAgICB9LAogICAgICAiY29udHJpYnV0aW5nLWZpbGUtZXhpc3RzIjogewogICAgICAgICJsZXZlbCI6ICJ3YXJuaW5nIiwKICAgICAgICAicnVsZSI6IHsKICAgICAgICAgICJ0eXBlIjogImZpbGUtZXhpc3RlbmNlIiwKICAgICAgICAgICJvcHRpb25zIjogewogICAgICAgICAgICAiZ2xvYnNBbnkiOiBbCiAgICAgICAgICAgICAgImRvY3MvQ09OVFJJQioiLAogICAgICAgICAgICAgICIuZ2l0aHViL0NPTlRSSUIqIiwKICAgICAgICAgICAgICAiQ09OVFJJQioiCiAgICAgICAgICAgIF0sCiAgICAgICAgICAgICJub2Nhc2UiOiB0cnVlCiAgICAgICAgICB9CiAgICAgICAgfQogICAgICB9CiAgICB9CiAgfQo='
    const [actual, actual2] = await Promise.all([
      execAsync(`${repolinterPath} lint -c ${encodedRuleset}`),
      execAsync(`${repolinterPath} lint --rulesetEncoded ${encodedRuleset}`)
    ])

    expect(actual.code).to.equal(0)
    expect(actual2.code).to.equal(0)
    expect(actual.out.trim()).to.contain('Lint:')
  })

  it('runs repolinter using invalid encoded ruleset', async () => {
    const encodedRuleset =
      'ewogICAgIiRzY2hlbWEiOiAiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3BoaWxpcHMtbGFicy9yZXBvbGludGVyL2ZlYXR1cmUvZ2l0aHViLWlzc3VlLWZpeC9ydWxlc2V0cy9zY2hlbWEuanNvbiIsCiAgICAidmVyc2lvbiI6IDIsCiAgICAiYXhpb21zIjogewogICAgICAibGluZ3Vpc3QiOiAibGFuZ3VhZ2UiLAogICAgICAibGljZW5zZWUiOiAibGljZW5zZSIsCiAgICAgICJwYWNrYWdlcnMiOiAicGFja2FnZXIiCiAgICB9LAogICAgInJ1bGVzIjogewogICAgICAibGljZW5zZS1maWxlLWV4aXN0cyI6IHsKICAgICAgICAibGV2ZWwiOiAid2FybmluZyIsCiAgICAgICAgInJ1bGUiOiB7CiAgICAgICAgICAidHlwZSI6ICJmaWxlLWV4aXN0ZW5jZSIsCiAgICAgICAgICAib3B0aW9ucyI6IHsKICAgICAgICAgICAgImdsb2JzQW55IjogWwogICAgICAgICAgICAgICJMSUNFTlNFKiIsCiAgICAgICAgICAgICAgIkNPUFlJTkcqIgogICAgICAgICAgICBdLAogICAgICAgICAgICAibm9jYXNlIjogdHJ1ZQogICAgICAgICAgfQogICAgICAgIH0KICAgICAgfSwKICAgICAgInJlYWRtZS1maWxlLWV4aXN0cyI6IHsKICAgICAgICAibGV2ZWwiOiAid2FybmluZyIsCiAgICAgICAgInJ1bGUiOiB7CiAgICAgICAgICAidHlwZSI6ICJmaWxlLWV4aXN0ZW5jZSIsCiAgICAgICAgICAib3B0aW9ucyI6IHsKICAgICAgICAgICAgImdsb2JzQW55IjogWwogICAgICAgICAgICAgICJSRUFETUUqIgogICAgICAgICAgICBdLAogICAgICAgICAgICAibm9jYXNlIjogdHJ1ZQogICAgICAgICAgfQogICAgICAgIH0sCiAgICAgICAgImZpeCI6IHsKICAgICAgICAgICJ0eXBlIjogImdpdGh1Yi1pc3N1ZS1jcmVhdGUiLAogICAgICAgICAgIm9wdGlvbnMiOiB7CiAgICAgICAgICAgICJpc3N1ZUxhYmVscyI6IFsKICAgICAgICAgICAgICAiY29udGludW91cy1jb21wbGlhbmNlIiwKICAgICAgICAgICAgICAiYXV0b21hdGVkIgogICAgICAgICAgICBdLAogICAgICAgICAgICAiYnlwYXNzTGFiZWwiOiAiQ0M6IEJ5cGFzcyIsCiAgICAgICAgICAgICJpc3N1ZVRpdGxlIjogIkNvbnRpbnVvdXMgQ29tcGxpYW5jZSAtIENyZWF0ZSBhIFJlYWQtbWUg8J+RjSIsCiAgICAgICAgICAgICJpc3N1ZUJvZHkiOiAiSGkgdGhlcmUg8J+RiywgXG4gUGhpbGlwcyB0cmllcyB0byBtYWtlIHN1cmUgdGhhdCByZXBvc2l0b3JpZXMgaW4gdGhpcyBvcmdhbml6YXRpb24gZm9sbG93IGEgY2VydGFpbiBzdGFuZGFyZGl6YXRpb24uIFdoaWxlIHJldmlld2luZyB5b3VyIHJlcG9zaXRvcnksIHdlIGNvdWxkIG5vdCBzdG9wIG91cnNlbHZlcyB0byBmdXJ0aGVyIGltcHJvdmUgdGhpcyByZXBvc2l0b3J5ISBcbiBcbiBBY2NvcmRpbmcgdG8gb3VyIHN0YW5kYXJkcywgd2UgdGhpbmsgdGhlIGZvbGxvd2luZyBjYW4gYmUgaW1wcm92ZWQ6IFxuIC0gQWRkIGEgUmVhZC1tZSBmaWxlIHRvIGV4cGxhaW4gdG8gb3RoZXIgcGVvcGxlIHdoYXQgeW91ciByZXBvc2l0b3J5IGlzIGFib3V0LiBcbiBcbiBQbGVhc2UgcmVmZXIgdG8gdGhlIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24uIFxuXG4iLAogICAgICAgICAgICAiY29tbWVudEJvZHkiOiAiSGV5LCBpdCdzIG1lLCBJIGFtIGJhY2vwn5iOLiBcbiBXZSBub3RpY2VkIHJlZ3Jlc3Npb24gb24gdGhpcyBpc3N1ZSwgc28gd2Ugb3BlbmVkIGFuZCB1cGRhdGVkIGl0LiBcbiBDb3VsZCB5b3UgcGxlYXNlIGhhdmUgYSBsb29rIHRvIHNlZSB3aGF0IGlzIGdvaW5nIG9uPyBcbiBcbiBJZiB5b3Ugd2FudCB0byBieXBhc3MgdGhlIGNoZWNrIGZvciB0aGlzIHJ1bGUsIGF0dGFjaCB0aGUgJ0NDOiBCeXBhc3MnIGxhYmVsLiBcbiBUaGFua3MhIiwKICAgICAgICAgICAgInVuaXF1ZVJ1bGVJZCI6ICI4OTMzYTg5OS0wZmFiLTQyM2MtOTliOS1lZDg4ZDk1OGYxOWQiCiAgICAgICAgICB9CiAgICAgICAgfQogICAgICB9LAogICAgICAiY29udHJpYnV0aW5nLWZpbGUtZXhpc3RzIjogewogICAgICAgICJsZXZlbCI6ICJ3YXJuaW5nIiwKICAgICAgICAicnVsZSI6IHsKICAgICAgICAgICJ0eXBlIjogImZpbGUtZXhpc3RlbmNlIiwKICAgICAgICAgICJvcHRpb25zIjogewogICAgICAgICAgICAiZ2xvYnNBbnkiOiBbCiAgICAgICAgICAgICAgImRvY3MvQ09OVFJJQioiLAogICAgICAgICAgICAgICIuZ2l0aHViL0NPTlRSSUIqIiwKICAgICAgICAgICAgICAiQ09OVFJJQioiCiAgICAgICAgICAgIF0sCiAgICAgICAgICAgICJub2Nhc2UiOiB0cnVlCiAgICAgICAgICB9CiAgICAgICAgfQogICAgICB9CiAgICB9CiAgf'
    const [actual, actual2] = await Promise.all([
      execAsync(`${repolinterPath} lint -c ${encodedRuleset}`),
      execAsync(`${repolinterPath} lint --rulesetEncoded ${encodedRuleset}`)
    ])

    expect(actual.code).to.equal(1)
    expect(actual2.code).to.equal(1)
    expect(actual.out.trim()).to.contain('configuration should be object')
    expect(actual2.out.trim()).to.contain('configuration should be object')
  })
  it('should handle encoded rulesets with encoded extends', async () => {
    const encodedRuleset =
      'JHNjaGVtYTogIi4uLy4uL3J1bGVzZXRzL3NjaGVtYS5qc29uIgpleHRlbmRzOiAiZXdvZ0lDSWtjMk5vWlcxaElqb2dJaTR1THk0dUwzSjFiR1Z6WlhSekwzTmphR1Z0WVM1cWMyOXVJaXdLSUNBaWRtVnljMmx2YmlJNklESXNDaUFnSW1GNGFXOXRjeUk2SUh0OUxBb2dJQ0p5ZFd4bGN5STZJSHNLSUNBZ0lDSjBaWE4wTFdacGJHVXRaWGhwYzNSeklqb2dld29nSUNBZ0lDQWliR1YyWld3aU9pQWlaWEp5YjNJaUxBb2dJQ0FnSUNBaWNuVnNaU0k2SUhzS0lDQWdJQ0FnSUNBaWRIbHdaU0k2SUNKbWFXeGxMV1Y0YVhOMFpXNWpaU0lzQ2lBZ0lDQWdJQ0FnSW05d2RHbHZibk1pT2lCN0NpQWdJQ0FnSUNBZ0lDQWlaMnh2WW5OQmJua2lPaUJiSW5SbGVIUmZabWxzWlY5bWIzSmZkR1Z6ZEM1MGVIUWlYUW9nSUNBZ0lDQWdJSDBLSUNBZ0lDQWdmUW9nSUNBZ2ZRb2dJSDBLZlFvPSIKdmVyc2lvbjogMgpydWxlczoKICB0ZXN0LWZpbGUtZXhpc3RzOgogICAgbGV2ZWw6IG9mZgo='
    const [actual, actual2] = await Promise.all([
      execAsync(`${repolinterPath} lint -c ${encodedRuleset}`),
      execAsync(`${repolinterPath} lint --rulesetEncoded ${encodedRuleset}`)
    ])
    expect(actual.code).to.equal(0)
    expect(actual2.code).to.equal(0)
    expect(actual.out.trim()).to.contain(
      `test-file-exists: ignored because level is "off"`
    )
    expect(actual2.out.trim()).to.contain(
      `test-file-exists: ignored because level is "off"`
    )
  })
  afterEach(async () => {
    return fs.promises
      .unlink(path.resolve('tests/cli/fixed.txt'))
      .catch(() => {})
  })
})
