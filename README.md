# Repo Linter [![Build Status](https://travis-ci.org/todogroup/repolinter.svg?branch=master)](https://travis-ci.org/todogroup/repolinter)

Given a repository, lint it nodfor quality checks.

## Examples

To quickly get started, checkout this repository and run repolinter against itself.

```
git clone https://github.com/todogroup/repolinter
node index.js .
✔ License file exists (LICENSE)
✔ Readme file exists (README.md)
✖ Contributing file doesn't exist
✔ File README.md contains License
✔ File of type .dll doesn't exist
✖ Licensee is not installed
✔ Test directory exists (tests)
```

## License

This project is licensed under the [Apache 2.0](LICENSE) license.
