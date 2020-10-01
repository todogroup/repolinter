# ![Repo Linter](https://raw.githubusercontent.com/todogroup/repolinter/master/docs/images/P_RepoLinter01_logo_only.png) ![Build Status](https://github.com/todogroup/repolinter/workflows/Build/badge.svg)

Lint open source repositories for common issues.

## Installation

Repolinter requires [Node.JS](https://nodejs.org/en/) >= v10 to function properly. Once Node.JS is installed, you can install Repolinter using `npm`:
```sh
npm install -g repolinter
```

## Linting a Local Repository

Once installed, run the following to lint a directory:
```sh
repolinter lint <directory>
```
The above command will lint `<directory>` with the local `repolinter.json` ruleset or the [default ruleset](./rulesets/default.json) if none is found:
```console
repolinter % repolinter lint .
Target directory: <directory>
Lint:
✔ license-file-exists: Found file (LICENSE)
✔ readme-file-exists: Found file (README.md)
✔ contributing-file-exists: Found file (CONTRIBUTING)
✔ code-of-conduct-file-exists: Found file (CODE-OF-CONDUCT)
✔ changelog-file-exists: Found file (CHANGELOG)
...
repolinter % echo $?
0
```

## Linting a Remote Repository

Repolinter also supports linting a git repository using the `--git` flag. With this flag enabled, the directory input will be interpreted as a git URL which Repolinter will automatically clone into a temporary directory.
```sh
repolinter lint -g https://github.com/todogroup/repolinter.git
```

## Formatting the Output

The Repolinter CLI currently supports three output formatting modes:
* Default (also referred to as result)
* JSON
* Markdown

You can switch formatters using the `--format` flag. An example of using the JSON formatter:
```console
repolinter % repolinter lint --format json .
{"params":{"targetDir":"/Users/nkoontz/Documents/code/repolinter","filterPaths":[],...
```
An example of using the Markdown formatter:
```console
repolinter % repolinter lint --format markdown .
# Repolinter Report

This Repolinter run generated the following results:
| ❗  Error | ❌  Fail | ⚠️  Warn | ✅  Pass | Ignored | Total |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 15 | 10 | 25 |
...
```

## Limiting Paths

Repolinter supports an allowed list of paths through the `--allowPaths` option to prevent the accidental linting of build artifacts. These paths must still be contained in the target directory/repository.
```sh
repolinter lint --allowPaths ./a/path --allowPaths /another/path
```

## Disabling Modifications

By default Repolinter will automatically execute fixes as specified by the [ruleset](#rulesets). If this is not desired functionality, you can disable this with the `--dryRun` flag.

## Ruleset Configuration

Similar to how [eslint](https://eslint.org/) uses an [eslintrc](https://eslint.org/docs/user-guide/configuring) file to determine what validation processes will occur, Repolinter uses a JSON or YAML configuration file (referred to as a *ruleset*) to determine what checks should be run against a repository. Inside a ruleset, there are two main behaviors that can be configured:
 * **Rules** - Checks Repolinter should perform against the repository.
 * **Axioms** - External libraries Repolinter should use to conditionally run rules.

These combined capabilities give you fine-grained control over the checks Repolinter runs.

### Providing a Ruleset

Repolinter will pull its configuration from the following sources in order of priority:
1. A ruleset specified with `--rulesetFile` or `--rulesetUrl`
2. A `repolint.json`, `repolinter.json`, `repolint.yaml`, or `repolinter.yaml` file at the root of the project being linted
3. The [default ruleset](./rulesets/default.json)

### Creating a Ruleset

Any ruleset starts with the following base, shown in both JSON and YAML format:
```JSON
{
  "$schema": "https://raw.githubusercontent.com/todogroup/repolinter/master/rulesets/schema.json",
  "version": 2,
  "axioms": {},
  "rules": {}
}
```
```YAML
version: 2
axioms: {}
rules:
```
Where:
 * **`$schema`**- points to the [JSON schema](./rulesets/schema.json) for all Repolinter rulesets. This schema both validates the ruleset and makes the ruleset creation process a bit easier.
 * **`version`** - specifies the ruleset version Repolinter should expect. Currently there are two versions: omitted for legacy config ([example](https://github.com/todogroup/repolinter/blob/1a66d77e3a744222a049bdb4041437cbcf26a308/rulesets/default.json)) and `2` for all others. Use `2` unless you know what you're doing.
 * **`axiom`** - The axiom functionality, covered in [Axoms](#axioms).
 * **`rules`** - The actual ruleset, covered in [Rules](#rules).

#### Rules

Rules are objects of the following format:
```JavaScript
"<rule-name>": {
  "level": "error" | "warning" | "off",
  "rule": {
    "type": "<rule-type>",
    "options": {
      // <rule-options>
    }
  },
  "where": ["condition=*"],
  "fix": {
    "type": "<fix-type>",
    "options": {
      // <fix-options>
    }
  },
  "policyInfo": "...",
  "policyUrl": "..."
}
```
```YAML
<rule-name>:
  level: error | warning | off
  rule:
    type: <rule-type>
    options:
      <rule-options>
  where: [condition=*]
  fix:
    type: <fix-type>
    options:
      <fix-options>
  policyInfo: >-
    ...
  policyUrl: >-
    ...
```
 * **`rule`** - The check to perform. Repolinter can perform any check listed under the [rules documentation](./docs/rules.md). Unlike eslint, Repolinter checks are designed to be reused and specialized: for example, the `file-existence` check can be used in a `README-file-exists` rule and a `LICENSE-file-exists` rule in the same ruleset. This allows a user to write a very specific ruleset from configuring generic checks.
 * **`level`** - The error level to notify if the check fails. `warning` will not change the exit code and `off` will not run the check.
 * **`where`** - Conditionally enable or disable this rule based off of [axioms](#axioms). Strings in this array follow the format of `<axiom>=<value>`, where value is either an axiom output or `*` to simply test if the axiom is enabled. If this option is present, this rule will only run if all specified axiom outputs are present. The available axioms in Repolinter can be found in the [axioms documentation](./docs/rules/axioms).
 * **`fix`** *(optional)* - The action to perform if the check performed by `rule` fails. Repolinter can perform any action listed under [fixes documentation](./docs/fixes.md).
 * **`policyInfo`**, **`policyUrl`** *(optional)* - Information used by the formatter to indicate why the check exists from a policy perspective. Note: `policyInfo` will automatically have a period appended to it for formatting purposes.

A minimal example of a rule that checks for the existence of a `README`:
```JSON
"readme-file-exists" : {
  "level": "error",
  "rule": {
    "type": "file-existence",
    "options": {
      "globsAny": ["README*"]
    }
  }
}
```
```YAML
readme-file-exists:
  level: error
  rule:
    type: file-existence
    options:
      globsAny:
      - README*
```

Checking that the `README` matches a certain hash, and replacing it if not:
```JSON
"readme-file-up-to-date" : {
  "level": "error",
  "rule": {
    "type": "file-hash",
    "options": {
      "globsAny": ["README*"],
      "algorithm": "sha256",
      "hash": "..."
    }
  },
  "fix": {
    "type": "file-create",
    "options": {
      "file": "README.md",
      "replace": true,
      "text": { "url": "www.example.com/mytext.txt" }
    }
  },
  "policyInfo": "Gotta keep that readme up to date",
  "policyUrl": "www.example.com/mycompany"
}
```
```YAML
readme-file-up-to-date:
  level: error
  rule:
    type: file-hash
    options:
      globsAny:
      - README*
      algorithm: sha256
      hash: "..."
  fix:
    type: file-create
    options:
      file: README.md
      replace: true
      text:
        url: www.example.com/mytext.txt
  policyInfo: Gotta keep that readme up to date
  policyUrl: www.example.com/mycompany

```

#### Axioms

```JSON
"axioms": {
  "<axiom-id>": "<axiom-target>"
}
```
```YAML
axioms:
  <axiom-id>: axiom-target
```

Each axiom is configured as a key value pair in the `axioms` object, where `<axiom-id>` specifies the program to run and `<axiom-target>` specifies the target to be used in the `where` conditional. The available axiom IDs can be found in the [axiom documentation](./docs/axioms.md). It should be noted that some axioms require external packages to run.

An example configuration using an axiom to detect the packaging system for a project:
```JavaScript
{
  "$schema": "https://raw.githubusercontent.com/todogroup/repolinter/master/rulesets/schema.json",
  "version": 2,
  "axioms": {
    "packagers": "package-type"
  },
  "rules": {
    "this-only-runs-if-npm": {
      "level": "error",
      "where": ["package-type=npm"],
      "rule": { /* ... */ }
    }
  }
}
```
```YAML
version: 2
axioms:
  packagers: package-type
rules:
  this-only-runs-if-npm:
    level: error
    where: [package-type=npm]
    rule:
      ...
```

Some axioms (ex. [`contributor-count`](./docs/axioms.md#contributor-count)) output numerical values instead of strings. For these axioms, numerical comparisons (`<`, `>`, `<=`, `>=`) can be also be specified in the `where` conditional. Note that if a numerical comparison is used for a non-numerical axiom, the comparison will always fail.
```JavaScript
{
  "axioms": {
    "contributor-count": "contributors"
  },
  "rules": {
    "my-rule": {
      "where": ["contributors>6", "contributors<200"],
      // ...
    }
  }
}
```
```YAML
axioms:
  contributor-count: contributors
rules:
  my-rule:
    where:
    - contributors>6
    - contributors<200
    rule:
      ...
```
## API

Repolinter also includes an extensible JavaScript API:
```JavaScript
const repolinter = require('repolinter')
const result = await repolinter.lint('.')
```

This API allows the developer to have complete control over the configuration and formatting Repolinter should use. Documentation for this library can be found under [API Documentation](https://todogroup.github.io/repolinter/#api-reference).

## Going Further

 * [Rule Reference](./docs/rules.md)
 * [Fix Reference](./docs/fixes.md)
 * [Axiom Reference](./docs/axioms.md)
 * [API Reference](https://todogroup.github.io/repolinter/#api-reference)
 * [Developer Guide](./docs/development.md)

## License

This project is licensed under the [Apache 2.0](LICENSE) license using https://reuse.software best practice.
