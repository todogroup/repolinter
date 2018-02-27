# ![Repo Linter](docs/images/P_RepoLinter01_logo_only.png) [![Build Status](https://travis-ci.org/todogroup/repolinter.svg?branch=master)](https://travis-ci.org/todogroup/repolinter)

Lint open source repositories for common issues.

## Usage

To run against a directory, add it to the command line `npx repolinter /my/code/dir`.

To run against a git repository, use the `--git` option: `npx repolinter --git https://my.git.code/awesome`.

Note, if you are running a version of npm < 5.2.0, run `npm install npx` first.

You can also run Repo Linter locally by cloning this repository and running `bin/repolinter.js` with either a directory of a git repository the same as above. This is useful during development.

## Examples

To quickly get started, checkout this repository and run `npx repolinter` against itself.

```
git clone https://github.com/todogroup/repolinter
npx repolinter
✔ license-file-exists: found (LICENSE)
✔ readme-file-exists: found (README.md)
✔ contributing-file-exists: found (CONTRIBUTING)
✔ readme-references-license: File README.md contains license
✔ binaries-not-present: Excluded file type doesn't exist (**/*.exe,**/*.dll)
✔ license-detectable-by-licensee: Licensee identified the license for project: Apache License 2.0
✔ test-directory-exists: found (tests)
✔ integrates-with-ci: found (.travis.yml)
✔ source-license-headers-exist: The first 5 lines of 'bin/repolinter.js' contain all of the requested patterns.
✔ package-metadata-exists: found (Gemfile)
✔ package-metadata-exists: found (package.json)
```

## Command line dependencies

The npm log-symbols package must be installed to run `repolinter`.
```
npm install log-symbols
```
Repolinter will use https://github.com/benbalter/licensee and https://github.com/github/linguist when installed.

Licensee will lead to a test being done to see if the project's licensee is identified by Licensee.

Linguist allows per-language tests to be performed.

Run `bundle install` to get Licensee and Linguist support.

## Custom Result Formatter
By default, results will be shown as in the example format above.

When using `repolinter` in another project, you can set `resultFormatter` to a custom formatter. Any custom formatter needs to have a `format` function that takes a single [Result](./lib/result.js) argument, and returns a string.

## Default ruleset
The default ruleset (```rulesets/default.json```) defines a set of common patterns against certain rules.  i.e., the `license-file-exists` and `readme-file-exists` default rules both trigger a `file-exists` test but against different file patterns.

All languages:
* [license-file-exists](#license-file-exists)
* [readme-file-exists](#readme-file-exists)
* [contributing-file-exists](#contributing-file-exists)
* [code-of-conduct-file-exists](#code-of-conduct-file-exists)
* [readme-references-license](#readme-references-license)
* [binaries-not-present](#binaries-not-present)
* [license-detectable-by-licensee](#license-detectable-by-licensee)
* [test-directory-exists](#test-directory-exists)
* [integrates-with-ci](#integrates-with-ci)
* [source-license-headers-exist]([#source-license-headers-exist)

### license-file-exists
Fails if there isn't a file matching ```LICENSE*``` or ```COPYING*``` in the root of the target directory.

### readme-file-exists
Fails if there isn't a file matching ```README*``` in the root of the target directory.

### contributing-file-exists
Fails if there isn't a file matching ```CONTRIB*``` in the root of the target directory.

### code-of-conduct-file-exists
Fails if there isn't a file matching ```CODEOFCONDUCT*```, ```CODE-OF-CONDUCT*``` or ```CODE_OF_CONDUCT*``` in the root of the target directory.

### code-of-conduct-file-contains-email
Fails of the code of conduct file does not contain an email address.

### readme-references-license
Fails if the files matching ```README*``` doesn't match the regular expression ```license```.

### binaries-not-present
Fails if ```*.dll``` or ```*.exe``` files are in the target directory.

### integrates-with-ci
Fails if there isn't a file supporting a Continuous Integration tool, matching ```.gitlab-ci.yml```, ```.travis.yml```, ```appveyor.yml```, ```circle.yml```, or ```Jenkinsfile```
 in the root of the target directory.

### source-license-headers-exist
Produces a failure for each file matching ```**/*.js,!node_modules/**``` option if the first 5 lines don't match all the patterns ```copyright```, ```all rights reserved```, and ```licensed under```.

### test-directory-exists
Fails if there isn't a directory matching ```test*``` or ```specs``` in the root of the target directory.


## Configuring rules

Currently you need to create a new ruleset to add, remove, or configure rules. We'll be adding the ability to inherit from an existing ruleset to simplify this in the future.

### Overriding the ruleset globally or for a project
To override the default ruleset copy ```rulesets/default.json``` to ```repolint.json``` (or ```repolinter.json```) in the target directory, any ancestor directory of the target directory, or your user directory.

### Disabling rules
To disable a rule change it's value to ```false```, for example:
```
{
  "rules": {
    "all": {
      "license-file-exists:file-existence": false
    }
  }
}
```

### Changing a rule's level
To change the level when a rule returns a failure change the first argument of the rule to ```error```, ```warning```, or ```info```, for example:
```
{
  "rules": {
    "all": {
      "license-detectable-by-licensee": ["info"]
    }
  }
}
```

### Configuring a rule's options
To configure a rule's options change the second argument of the rule to an object specifying the rule's options, see [rules](#rules) for details about each rule's options. For example:
```
{
  "rules": {
    "all": {
      "source-license-headers-exist:file-starts-with": ["warning", {"files": ["**/*.java"], "lineCount": 2, "patterns": ["Copyright", "All rights reserved", "Licensed under"]}]
    }
  }
}
```

### Language-specific rules
Rules can be configured to only run if the repository contains a specific language. Languages are detected using Linguist which must be in your path, see [command line dependencies](#command-line-dependencies) for details.


## Rules

The rules system is made up of rule types which can be customized to fit your needs.

### directory-existence
Fails if none of the directories specified in the ```directories``` option exist.

### file-contents
Fails if the content of any of the files specified in the ```files``` option doesn't match the regular expression specified in the ```content``` option. If the content is a regular expression or some other non-human-readable string, include the ```human-readable-content``` option with human-readable output.

### file-existence
Fails if none of the files specified in the ```files``` option exist. Pass in a ```fail-message``` option to further explain why the file should exist to the user.

### file-not-contents
The opposite of ```file-contents```.

### file-starts-with
Produces a failure for each file matching the ```files``` option if the first ```lineCount``` lines don't match all of the regular expressions specified in the ```patterns``` option.

### file-type-exclusion
Fails if any files match the ```type``` option.

### git-grep-commits
Searches Git commits for configurable blacklisted words. These
words can in fact be extended regular expressions. These checks can be
a bit time consuming, depending on the size of the Git history.

### git-grep-log
Searches Git commit messages for configurable blacklisted words. These
words can in fact be extended regular expressions. These checks can be
a bit time consuming, depending on the size of the Git history.

### git-list-tree
Check for blacklisted paths in Git.

### git-working-tree
Checks whether the directory is managed with Git.

### license-detectable-by-licensee
Fails if Licensee doesn't detect the repository's license.

This rule requires ```licensee``` in the path, see [command line dependencies](#command-line-dependencies) for details.


## License

This project is licensed under the [Apache 2.0](LICENSE) license.
