# Repo Linter [![Build Status](https://travis-ci.org/todogroup/repolinter.svg?branch=master)](https://travis-ci.org/todogroup/repolinter)

Lint open source repositories for common issues.

## Examples

To quickly get started, install repolinter and run it in the root of one of your repositories.

```
npm install -g repolinter
repolinter
✔ license-file-exists: found (LICENSE)
✔ readme-file-exists: found (README.md)
✔ contributing-file-exists: found (CONTRIBUTING)
✔ readme-references-license: File README.md contains license
✔ binaries-not-present: Excluded file type doesn't exist (**/*.exe,**/*.dll)
✔ license-detectable-by-licensee: Licensee identified the license for project: Apache License 2.0
✔ test-directory-exists: found (tests)
✔ source-license-headers-exist: exist
```

## Command line dependencies

Repo Linter will use https://github.com/benbalter/licensee and https://github.com/github/linguist when installed.

Licensee will lead to a test being done to see if the project's licensee is identified by Licensee.

Linguist allows per-language tests to be performed.

Run `bundle install` to get Lincensee and Linguist support.

## Default ruleset
The default ruleset (```rulesets/default.json```) enables the following rules:

All languages:
* [binaries-not-present](#binaries-not-present)
* [contributing-file-exist](#contributing-file-exists)
* [license-detectable-by-licensee](#license-detectable-by-licensee)
* [license-file-exists](#license-file-exists)
* [readme-file-exists](#readme-file-exists)
* [readme-references-license](#readme-references-license)
* [source-license-headers-exist]([#source-license-headers-exist)
* [test-directory-exists](#test-directory-exists)

## Configuring rules
Currently you need to create a new ruleset to add, remove, or configure rules. We'll be adding the ability to inherit from an existing ruleset to simplify this in the future.

### Overriding the ruleset globally or for a project
To override the default ruleset copy ```rulesets/default.json``` to ```repolint.json``` in the target directory, any ancenstor directory of the target directory, or your user directory.

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
### binaries-not-present
Fails if ```*.dll``` or ```*.exe``` files are in the target directory.

### contributing-file-exists
Fails if there isn't a file matching ```CONTRIB*``` in the root of the target directory.

### directory-existence
Fails if none of the directories specified in the ```directories``` option exist.

### file-contents
Fails if the content of the file specified in the ```file``` option doesn't match the regular expression specified in the ```content``` option. 

### file-existence
Fails if none of the files specified in the ```files``` option exist.

### file-starts-with
Produces a failure for each file matching the ```files``` option if the first ```lineCount``` lines don't match all of the regular expressions specified in the ```patterns``` option.

### file-type-exclusion
Fails if any files match the ```type``` option.

### license-detectable-by-licensee
Fails if Licensee doesn't detect the repository's license.

This rule requires ```licensee``` in the path, see (command line dependencies)[#command-line-dependencies] for details.

### license-file-exists
Fails if there isn't a file matching ```LICENSE*``` or ```COPYING*``` in the root of the target directory.

### readme-file-exists
Fails if there isn't a file matching ```README*``` in the root of the target directory.

### readme-references-license
Fails if the file ```README.md``` doesn't match the regular expression ```license```.

### source-license-headers-exist
Produces a failure for each file matching ```**/*.js,!node_modules/**``` option if the first 5 lines don't match all the patterns ```copyright```, ```all rights reserved```, and ```licensed under```.

### test-directory-exists
Fails if there isn't a directory matching ```test*``` or ```specs``` in the root of the target directory.

## License

This project is licensed under the [Apache 2.0](LICENSE) license.
