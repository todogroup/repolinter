# Axioms

Below is a complete list of axioms that Repolinter can check.

## Contents

- [Contents](#contents)
- [Reference](#reference)
  - [`contributor-count`](#contributor-count)
  - [`licensee`](#licensee)
  - [`linguist`](#linguist)
  - [`packagers`](#packagers)

## Reference

### `contributor-count`

This axiom uses [gitlog](https://github.com/domharrington/node-gitlog#readme) to count the number of contributors to the current git repository. Contributors are counted based on unique occurrences of an author name in the git log. This axiom is a numerical axiom, meaning numerical comparisons can be used.

An example of using this axiom:

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

### `licensee`

This axiom uses [licensee](https://github.com/licensee/licensee) to detect the license used in the current repository. To use this axiom licensee must be installed in your `PATH` or in the same directory as Repolinter.
This axiom will return a list of [license identifiers](https://spdx.org/licenses/) associated with the current repository.

An example of using this axiom:
```JavaScript
{
  "axioms": {
    "licensee": "license"
  },
  "rules": {
    "my-rule": {
      "where": ["license=Apache-2.0"],
      // ...
    }
  }
}
```

### `linguist`

This axiom uses GitHub's [linguist](https://github.com/github/linguist) to detect programming languages in the current repository. To use this axiom, linguist must be installed in the system `PATH` or in the same directory as Repolinter. This axiom will return a lowercase list of programming languages from [this list of supported languages](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml).

An example of using this axiom:
```JavaScript
{
  "axioms": {
    "linguist":" language"
  },
  "rules": {
    "my-rule": {
      "where": ["language=javascript"],
      // ...
    }
  }
}
```

### `packagers`

This axiom detects the projects packaging system by looking for project metadata files such as the [package.json](https://docs.npmjs.com/files/package.json). The list of detectable packaging systems can be found in the [axiom source](../../axioms/packagers.js).
