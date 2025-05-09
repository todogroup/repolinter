# [0.12.0](https://github.com/todogroup/repolinter/compare/v0.11.2...v0.12.0) (2025-05-09)


### Bug Fixes

* add docs directory ([0ccdcd8](https://github.com/todogroup/repolinter/commit/0ccdcd87f28ae9ea66cad1ce4d7d1aa308be84f2))
* broken test case. ([4816a53](https://github.com/todogroup/repolinter/commit/4816a53a9958fe929623f1e5f779b362438ae4b9))
* schema $id mixup. ([6bc0828](https://github.com/todogroup/repolinter/commit/6bc08284d3ba10d3e29b77a54ab0bf7cf0d5645c))
* semantic release update to main ([f01a516](https://github.com/todogroup/repolinter/commit/f01a516696dd019c251f8ab8622289308114c6bd))
* update axioms, fixes and rules for documentation ([7432dfe](https://github.com/todogroup/repolinter/commit/7432dfef156cc81aa90472726da95cb1e5079ad7))
* update test case for 'fail-on-non-existent' scenario, the 'passed' of non-exist file should depend on the parameter. ([e31bfb3](https://github.com/todogroup/repolinter/commit/e31bfb32cd333a577c1d3ff6657ee55fb0ebe2c6))


### Features

* add 'files-not-contents' rule to make string detection rulesets easier to maintain. ([093afc3](https://github.com/todogroup/repolinter/commit/093afc30f78bf53fc0fb5c15a103df17b045e542))
* add better regex context support for file-contents ([2ff65d1](https://github.com/todogroup/repolinter/commit/2ff65d1b88d2ca7d2d087157f9a91df83f6a9470))
* add files-not-hash rule for files detections. ([d2f262a](https://github.com/todogroup/repolinter/commit/d2f262ab729f9f8117b7296be0478b9d4be63ab6))
* add large file rules ([2e48a85](https://github.com/todogroup/repolinter/commit/2e48a857771402db1c33daee73bf5a47d9c280be))
* add lines of regex match in the file-contents and file-not-contents rule output, default turned off. ([9831684](https://github.com/todogroup/repolinter/commit/983168407c7d8b9bae76107aacb55513b4dc3a49))
* add policyUrl and policyInfo in the default output. ([fb81866](https://github.com/todogroup/repolinter/commit/fb81866ad095dadf8258d150de3e875deff90e93))
* add relative path resolving to rulesetPath ([561e895](https://github.com/todogroup/repolinter/commit/561e895fa56947c36d585faf960f051e6df0a4e1))
* update github pull request template locations ([c2d0f40](https://github.com/todogroup/repolinter/commit/c2d0f40299d94d60e7eb0bf3bcc740945bbd24c0))

## [0.11.2](https://github.com/todogroup/repolinter/compare/v0.11.1...v0.11.2) (2021-09-27)


### Bug Fixes

* update dockerfile to fix bad copying ([#224](https://github.com/todogroup/repolinter/issues/224)) ([92389be](https://github.com/todogroup/repolinter/commit/92389bec927d91c0220dd0f9f01d7c1a0c1148be))

## [0.11.1](https://github.com/todogroup/repolinter/compare/v0.11.0...v0.11.1) (2021-04-14)


### Bug Fixes

* update github-markup to remove python2 dependency ([#209](https://github.com/todogroup/repolinter/issues/209)) ([0c7c50c](https://github.com/todogroup/repolinter/commit/0c7c50c41b620f876d1da84318800a9dde9cc9d6))

# [0.11.0](https://github.com/todogroup/repolinter/compare/v0.10.1...v0.11.0) (2021-04-14)


### Features

* add support for inheriting rulesets ([#207](https://github.com/todogroup/repolinter/issues/207)) ([ca1ae01](https://github.com/todogroup/repolinter/commit/ca1ae01996bbf30c687126fe51d84c4f2b979f7e)), closes [#21](https://github.com/todogroup/repolinter/issues/21)

## [0.10.1](https://github.com/todogroup/repolinter/compare/v0.10.0...v0.10.1) (2021-03-25)


### Bug Fixes

* switch to canonical broken-link-checker ([#205](https://github.com/todogroup/repolinter/issues/205)) ([e62d767](https://github.com/todogroup/repolinter/commit/e62d767dc299c503d04ff61da6433fede6899eb8))

# [0.10.0](https://github.com/todogroup/repolinter/compare/v0.9.0...v0.10.0) (2020-12-30)


### Bug Fixes

* add missing github-markup dependencies to dockerfile ([b5fb88a](https://github.com/todogroup/repolinter/commit/b5fb88ad4c763dcb2c693a2a41b7ce3b2f183bcf))
* file-hash now accepts legacy configuration format ([d509274](https://github.com/todogroup/repolinter/commit/d50927423c965054d154adb56aaf1c48db778182))
* fix broken link behavrior with files in subdirectories ([6c14db9](https://github.com/todogroup/repolinter/commit/6c14db9fb7348fd42b72bc4ffc4ef7e4d6376409))
* fix pathing issues and succeed/fail criteria with no files found ([c0c101b](https://github.com/todogroup/repolinter/commit/c0c101b2871abb4df584b6ce6cb76aeda3c8eb0a))
* remove Object.fromEntries for node 10 support ([0644374](https://github.com/todogroup/repolinter/commit/0644374c596f4e770e1d440f3980cd760ef9aa82))
* update dockerfile to reconfigure bundle which (may) have caused some bugs on linux ([889da3e](https://github.com/todogroup/repolinter/commit/889da3ebf7475073726799a48b2a370798244af0))
* upgrade broken-link-checker to add node 10 support ([4f00b33](https://github.com/todogroup/repolinter/commit/4f00b33c0e27d8a6bdad7c4ca6e00fe57ec94d90))
* upgrade ruby gems to latest version ([e36c10a](https://github.com/todogroup/repolinter/commit/e36c10a9755a09c538d5dcc483c30f2e1b73c91a))


### Features

* finalize no broken links rule and dockerfile ([c1b1f72](https://github.com/todogroup/repolinter/commit/c1b1f721c788894bb2cb59044fb9740c7f01d9ea))
* update dockerfile to reflect new dependencies ([c256af7](https://github.com/todogroup/repolinter/commit/c256af7cdb682bdd4880577207f40446c8ede640))
* **no-broken-links:** add option to pass or not pass in external links ([aaa92f8](https://github.com/todogroup/repolinter/commit/aaa92f8e083c9e84ab4882f63cb905669f129930))
* switch to fork of broken-link-checker ([7df3086](https://github.com/todogroup/repolinter/commit/7df308645ab883d70da15ac70e054e56a8a5628e))
* WIP adding a broken link checker rule ([9e8bb98](https://github.com/todogroup/repolinter/commit/9e8bb98e34f55a52359fbbfa1a85071d9548f4d1))

# Changelog

## 1.0.0

### Breaking Changes

- The ruleset configuration format has been upgraded to [version 2](./README.md#creating-a-ruleset), including adding a [JSON schema](./rulesets/schema.json) and support for YAML. The previous ruleset format is still supported, however it is recommended that you translate your rulesets for this upgrade.
- Major changes have been made to the `lint` function:
  - Formatting and printing have been moved outside `lint`, allowing the developer to suppress or modify the output as needed. This change is reflected in the new [CLI implementation](./bin/repolinter.js).
  - The object returned by lint (`LintResult`) has been completely restructured.
  - A `dryRun` parameter has been added to disable fixes.
  - `async` was added to the function interface.
- Major changes have been make to the [JSON Formatter](index.js) to accommodate the structure change of `LintResult`.
- Non top-level configuration support (ex. `targetdir/otherdir/repolinter.json` would trigger another lint of `otherdir`) has been removed for now.
- Renamed several rule options to more clearly convey functionality (`files` -> `globsAny`) and remove problematic language (`blacklist` -> `denylist`). Backwards compatibility for old property names in version 1 rulesets is still maintained, however the schema will fail to validate in version 2.
- Some slight changes have been made to the default formatter to accommodate the feature list below.

### Features

- [Automatic fixes](./docs/fixes.md) have been added. These fixes must be [configured in your ruleset](./README.md#rules) before they can be used, but are otherwise enabled by default.
- [Markdown formatting](README.md#formatting-the-output) is now supported via a CLI argument.
- CLI argument parsing has re-implemented with [Yargs](https://github.com/yargs/yargs) to allow for a more user-friendly experience. All previous commands and arguments remain, and the following new options are now available:

  - `--dryRun`/`-d` - Disable fixes.
  - `--allowPaths`/`-a` - Specify an allowlist that repolinter should limit itself to.
  - `--rulesetFile`/`-r` - Manually specify the configuration repolinter should use.
  - `--rulesetUrl`/`-u` - Specify a URL where repolinter can retrieve the ruleset from.
  - `--format`/`-f` - Change the output format.

  For more information on these options please see the [Repolinter CLI](./bin/repolinter.js).

- Added several other functions to the Node API: `runRuleset`, `determineTargets`, `validateConfig`, and `parseConfig`.
- Added TypeScript types for the Node API.
- Add numerical comparison support for axioms and the [`contributor-count`](./docs/axioms.md#contributor-count) axiom.

### Fixes

- All file-based operations have been moved to `fs.promises`, which increased performance by a factor of 10.
- Fixed some issues with Windows paths.
- Updated NPM dependencies.
- Added more tests and [autogenerated documentation](https://todogroup.github.io/repolinter/).
