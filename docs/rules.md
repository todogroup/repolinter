# Rules

Below is a complete list of rules that Repolinter can run, along with their configuration options.

## Contents

- [Contents](#contents)
- [Reference](#reference)
  - [`apache-notice`](#apache-notice)
  - [`directory-existence`](#directory-existence)
  - [`file-contents`](#file-contents)
  - [`file-existence`](#file-existence)
  - [`file-hash`](#file-hash)
  - [`file-no-broken-links`](#file-no-broken-links)
  - [`file-not-contents`](#file-not-contents)
  - [`file-not-exists`](#file-not-exists)
  - [`file-starts-with`](#file-starts-with)
  - [`file-type-exclusion`](#file-type-exclusion)
  - [`git-grep-commits`](#git-grep-commits)
  - [`git-grep-log`](#git-grep-log)
  - [`git-list-tree`](#git-list-tree)
  - [`git-working-tree`](#git-working-tree)
  - [`json-schema-passes`](#json-schema-passes)
  - [`license-detectable-by-licensee`](#license-detectable-by-licensee)
  - [`best-practices-badge-present`](#best-practices-badge-present)
  - [`any-file-contents`](#any-file-contents)
  - [`file-or-directory-existence`](#file-or-directory-existence)

## Reference

### `apache-notice`

No inputs. Checks for the presense of a `NOTICE` file in the root of the repository. This rule is equivalent to the following:

```JSON
{
  "type": "file-existence",
  "options": {"globsAny": ["NOTICE*"]}
}
```

### `directory-existence`

Checks the existence of a given directory.

| Input          | Required | Type       | Default | Description                                                                                        |
| -------------- | -------- | ---------- | ------- | -------------------------------------------------------------------------------------------------- |
| `globsAny`     | **Yes**  | `string[]` |         | A list of globs to search for. This rule passes if at least one glob returns a directory.          |
| `nocase`       | No       | `boolean`  | `false` | Set to `true` to perform an case insensitive search.                                               |
| `fail-message` | No       | `string`   | `""`    | The string to print if the directory does not exist, used to create human-readable error messages. |

### `file-contents`

Checks if the contents of a file match a given regular expression.

| Input                    | Required | Type       | Default                             | Description                                                                                                                                                                                                                      |
| ------------------------ | -------- | ---------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `globsAll`               | **Yes**  | `string[]` |                                     | A list of globs to get files for. This rule passes if all of the files returned by the globs match the supplied string, or if no files are returned.                                                                             |
| `content`                | **Yes**  | `string`   |                                     | The regular expression to check using `String#search`. This expression should not include the enclosing slashes and may need to be escaped to properly integrate with the JSON config (ex. `".+@.+\\..+"` for an email address). |
| `nocase`                 | No       | `boolean`  | `false`                             | Set to `true` to make the globs case insensitive. This does not effect the case sensitivity of the regular expression.                                                                                                           |
| `flags`                  | No       | `string`   | `""`                                | The flags to use for the regular expression in `content` (ex. `"i"` for case insensitivity).                                                                                                                                     |
| `human-readable-content` | No       | `string`   | The regular expression in `content` | The string to print instead of the regular expression when generating human-readable output.                                                                                                                                     |
| `fail-on-non-existent`      | No       | `boolean`  | `false`                             | Set to `true` to disable passing if no files are found from `globsAll`.                                                                                                                                                          |

### `file-existence`

Checks the existence of a given file.

| Input          | Required | Type       | Default | Description                                                                                        |
| -------------- | -------- | ---------- | ------- | -------------------------------------------------------------------------------------------------- |
| `globsAny`     | **Yes**  | `string[]` |         | A list of globs to search for. This rule passes if at least one glob returns a file.               |
| `nocase`       | No       | `boolean`  | `false` | Set to `true` to perform an case insensitive search.                                               |
| `dirs`         | No       | `boolean`  | `false` | Set to `true` to include directories in the search (equivalent to `directory-exists`)              |
| `fail-message` | No       | `string`   | `""`    | The string to print if the directory does not exist, used to create human-readable error messages. |

### `file-hash`

Checks that a given file matches a provided hash.

| Input                  | Required | Type       | Default  | Description                                                                                                                                                                  |
| ---------------------- | -------- | ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `globsAny`             | **Yes**  | `string[]` |          | A list of globs to search for. This rule passes if at least one file found matches the provided hash, and fails if no files are found.                                       |
| `hash`                 | **Yes**  | `string`   |          | The hash to check against. Unless a different `algorithm` is specified, this will be sha256.                                                                                 |
| `algorithm`            | No       | `string`   | `sha256` | The hash algorithm to use. Repolinter supports any algorithm supported by [crypto.createHash](https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm_options) |
| `nocase`               | No       | `boolean`  | `false`  | Set to `true` to perform an case insensitive search.                                                                                                                         |
| `succeed-on-non-exist` | No       | `boolean`  | `false`  | Set to `true` to enable passing if no files are found from `globsAll`.                                                                                                       |

### `file-no-broken-links`

Scans a set of markup files for broken links. Links are tested by first rendering the markup file to HTML using [github-markup](https://github.com/github/markup), then each `<a>` tag in the HTML is extracted and tested using [broken-link-checker](https://github.com/prototypicalpro/broken-link-checker)--as a result, this rule only supports checking markup formats supported by [github-markup](https://github.com/github/markup). Absolute URLs are checked using a HTTP request, and relative URLs are checked by accessing the file specified.

[github-markup](https://github.com/github/markup) and its dependencies must be installed and available in `PATH` to use this rule.

| Input                          | Required | Type       | Default | Description                                                                                                                                                              |
| ------------------------------ | -------- | ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `globsAll`                     | **Yes**  | `string[]` |         | A list of globs to search for. This rule passes if all of the markup files found do not contain broken links.                                                            |
| `nocase`                       | No       | `boolean`  | `false` | Set to `true` to perform an case insensitive search.                                                                                                                     |
| `succeed-on-non-exist`         | No       | `boolean`  | `false` | Set to `true` to enable passing if no files are found from `globsAll`.                                                                                                   |
| `pass-external-relative-links` | No       | `boolean`  | `false` | Set to `true` to allow relative URLs outside of the target directory. As there is no good way to check these URLs, they will automatically pass if this setting is true. |


### `file-not-contents`

Checks none of a given list of files match a given regular expression.

| Input                    | Required | Type       | Default                             | Description                                                                                                                                                                                                                      |
| ------------------------ | -------- | ---------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `globsAll`               | **Yes**  | `string[]` |                                     | A list of globs to get files for. This rule passes if none of the files returned by the globs match the supplied string, or if no files are returned.                                                                            |
| `content`                | **Yes**  | `string`   |                                     | The regular expression to check using `String#search`. This expression should not include the enclosing slashes and may need to be escaped to properly integrate with the JSON config (ex. `".+@.+\\..+"` for an email address). |
| `nocase`                 | No       | `boolean`  | `false`                             | Set to `true` to make the globs case insensitive. This does not effect the case sensitivity of the regular expression.                                                                                                           |
| `flags`                  | No       | `string`   | `""`                                | The flags to use for the regular expression in `content` (ex. `"i"` for case insensitivity).                                                                                                                                     |
| `human-readable-content` | No       | `string`   | The regular expression in `content` | The string to print instead of the regular expression when generating human-readable output.                                                                                                                                     |
| `fail-on-non-existent`      | No       | `boolean`  | `false`                             | Set to `true` to disable passing if no files are found from `globsAll`.                                                                                                                                                          |

### `file-not-exists`

Checks that a file doesn't exist.

| Input          | Required | Type       | Default | Description                                                                                   |
| -------------- | -------- | ---------- | ------- | --------------------------------------------------------------------------------------------- |
| `globsAll`     | **Yes**  | `string[]` |         | A list of globs to search for. This rule fails if at least one glob returns a file.           |
| `nocase`       | No       | `boolean`  | `false` | Set to `true` to perform an case insensitive search.                                          |
| `dirs`         | No       | `boolean`  | `false` | Set to `true` to include directories in the search.                                           |
| `pass-message` | No       | `string`   | `""`    | The string to print if the file does not exist, used to create human-readable error messages. |

### `file-starts-with`

Checks that the first lines of a file contain a set of regular expressions.

| Input                  | Required | Type                                                             | Default | Description                                                                                                                                                                                                                         |
| ---------------------- | -------- | ---------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `globsAll`             | **Yes**  | `string[]`                                                       |         | A list of globs to search for. This rule passes if the starting contents of all found files match all patterns, and fails if no files are found.                                                                                    |
| `lineCount`            | **Yes**  | `number`                                                         |         | The number of lines to scan into for each file.                                                                                                                                                                                     |
| `patterns`             | **Yes**  | `string[]`                                                       |         | The regular expressions to check using `String#search`. These expressions should not include the enclosing slashes and may need to be escaped to properly integrate with the JSON config (ex. `".+@.+\\..+"` for an email address). |
| `flags`                | No       | `string`                                                         | `""`    | The flags to use for the regular expressions in `patterns` (ex. `"i"` for case insensitivity).                                                                                                                                      |
| `nocase`               | No       | `boolean`                                                        | `false` | Set to `true` to perform an case insensitive search on the files. This will not effect the case sensitivity of `patterns`.                                                                                                          |
| `succeed-on-non-exist` | No       | `boolean`                                                        | `false` | Set to `true` to enable passing if no files are found from `globsAll`.                                                                                                                                                              |
| `skip-binary-files`    | No       | `boolean`                                                        | `false` | Set to `true` to exclude binary files from `globsAll`.                                                                                                                                                                              |
| `skip-paths-matching`  | No       | `{ extensions?: string[], patterns?: string[], flags?: string }` | `{}`    | Use this option to exclude paths from `globsAll`, either by file extension or by regular expression.                                                                                                                                |

### `file-type-exclusion`

Checks that no files exist of a certain filetype.

| Input  | Required | Type       | Default | Description                                                            |
| ------ | -------- | ---------- | ------- | ---------------------------------------------------------------------- |
| `type` | **Yes**  | `string[]` |         | A list of globs to search for. This rule passes if no files are found. |

### `git-grep-commits`

Searches Git commits for configurable blacklisted words. These checks can be
a bit time consuming, depending on the size of the Git history.

| Input        | Required | Type       | Default | Description                                      |
| ------------ | -------- | ---------- | ------- | ------------------------------------------------ |
| `denylist`   | **Yes**  | `string[]` |         | A list of patterns to search for.                |
| `ignoreCase` | No       | `boolean`  | `false` | Set to true to make `denylist` case insensitive. |

### `git-grep-log`

Searches Git commit messages for configurable blacklisted words. These checks can be
a bit time consuming, depending on the size of the Git history.

| Input        | Required | Type       | Default | Description                                      |
| ------------ | -------- | ---------- | ------- | ------------------------------------------------ |
| `denylist`   | **Yes**  | `string[]` |         | A list of patterns to search for.                |
| `ignoreCase` | No       | `boolean`  | `false` | Set to true to make `denylist` case insensitive. |

### `git-list-tree`

Check for blacklisted filepaths in Git.

| Input        | Required | Type       | Default | Description                                                        |
| ------------ | -------- | ---------- | ------- | ------------------------------------------------------------------ |
| `denylist`   | **Yes**  | `string[]` |         | A list of patterns to search against all paths in the git history. |
| `ignoreCase` | No       | `boolean`  | `false` | Set to true to make `denylist` case insensitive.                   |

### `git-working-tree`

Checks whether the directory is managed with Git.

| Input         | Required | Type      | Default | Description                                                   |
| ------------- | -------- | --------- | ------- | ------------------------------------------------------------- |
| `allowSubDir` | No       | `boolean` |         | Whether or not to search subdirectories for a git repository. |

### `json-schema-passes`

Checks if a given file matches a provided [JSON schema](https://json-schema.org/). This check is performed using [AJV](https://ajv.js.org/).

| Input                    | Required | Type        | Default                | Description                                                                                          |
| ------------------------ | -------- | ----------- | ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `glob`                   | **Yes**  | `string`    |                        | The file to check a schema against. If more than one file is found, the first match will be checked. |
| `schema`                 | **Yes**  | JSON Schema |                        | The JSON schema to validate against, as a JSON object.                                               |
| `nocase`                 | No       | `boolean`   | `false`                | Set to `true` to perform an case insensitive search.                                                 |
| `human-readable-message` | No       | `string`    | The schema in `schema` | The string to print instead of the schema when generating human-readable output.                     |
| `succeed-on-non-exist`   | No       | `boolean`   | `false`                | Set to `true` to enable passing if no files are found from `glob`.                                   |

### `license-detectable-by-licensee`

Fails if Licensee doesn't detect the repository's license. This rule takes no inputs, but requires `licensee` in the path, see [command line dependencies](#command-line-dependencies) for details.

### `best-practices-badge-present`

Check Best Practices Badge is present in README. Optionally check a certain badge level is accomplished.

| Input        | Required | Type       | Default | Description                                                        |
| ------------ | -------- | ---------- | ------- | ------------------------------------------------------------------ |
| `minPercentage` | No       | `integer`  | `null` | Minimum [Tiered Percentage](https://github.com/coreinfrastructure/best-practices-badge/blob/main/doc/api.md#tiered-percentage-in-openssf-best-practices-badge) accomplished by project. `passing=100`, `silver=200`, `gold=300`, set to `0` or `null` to disable check. |


### `any-file-contents`
Checks if the contents of at least one file in a given list match a given regular expression.

| Input                    | Required | Type       | Default                             | Description                                                                                                                                                                                                                      |
| ------------------------ | -------- | ---------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `globsAny`               | **Yes**  | `string[]` |                                     | A list of globs to get files for. This rule passes if at least one of the files returned by the globs match the supplied string, or if no files are returned.                                                                             |
| `content`                | **Yes**  | `string`   |                                     | The regular expression to check using `String#search`. This expression should not include the enclosing slashes and may need to be escaped to properly integrate with the JSON config (ex. `".+@.+\\..+"` for an email address). |
| `nocase`                 | No       | `boolean`  | `false`                             | Set to `true` to make the globs case insensitive. This does not effect the case sensitivity of the regular expression.                                                                                                           |
| `flags`                  | No       | `string`   | `""`                                | The flags to use for the regular expression in `content` (ex. `"i"` for case insensitivity).                                                                                                                                     |
| `human-readable-content` | No       | `string`   | The regular expression in `content` | The string to print instead of the regular expression when generating human-readable output.                                                                                                                                     |
| `fail-on-non-existent`      | No       | `boolean`  | `false`                             | Set to `true` to disable passing if no files are found from `globsAll`.                                                                                                                                                          |

### `file-or-directory-existence`

Checks the existence of a given file OR directory.

| Input          | Required | Type       | Default | Description                                                                                        |
| -------------- | -------- | ---------- | ------- | -------------------------------------------------------------------------------------------------- |
| `globsAny`     | **Yes**  | `string[]` |         | A list of globs to search for. This rule passes if at least one glob returns a file or directory.  |
| `nocase`       | No       | `boolean`  | `false` | Set to `true` to perform an case insensitive search.                                               |
| `fail-message` | No       | `string`   | `""`    | The string to print if file or directory does not exist, used to create human-readable error messages. |
