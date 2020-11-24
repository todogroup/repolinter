# Development

Repolinter is broken down into 7 main components, each of which is contained in a subfolder:

- **Axioms** - located under [axioms](../../axioms)
- **CLI** - located under [bin](../../bin)
- **Rules** - located under [rules](../../rules)
- **Fixes** - located under [fixes](../../fixes)
- **Formatters** - located under [formatters](../../formatters)
- **Utilities** - located under [lib](../../lib)
- **Built-In Rulesets and Schema** - located under [rulesets](../../rulesets)

## Axioms

Axioms are registered in [axioms/axioms.js](../../axioms/axioms.js) and in [rulesets/schema.json](../../rulesets/schema.json). An axiom implementation consists of a module with the following interface:

```TypeScript
async (fs: FileSystem) => Result
```

Where fs is a [`FileSystem`](../../lib/file_system.js) scoped to the current repository.

The contents of the result should be an array of targets where `t.path` is a target that the axiom has determined is valid (ex. for language detecting axiom a possible result could be `new Result('', [{ path: 'javascript' passed: true }, { path: 'typescript', passed: true}], true)`). If the axiom fails to execute, it should return a failing result with an error message included instead of throwing an error.

## Rules

A rule consists of two parts: a JavaScript module, which determines the rule's functionality and a JSON schema, which validates the rule's configuration options in rulesets. Rules are registered in [rules/rules.js](../../rules/rules.js) and [rulesets/schema.json](../../rulesets/schema.json). Rules are also documented under [rules.md](./rules.md).

### Rule Configuration JSON Schema

The configuration JSON schema determines how `rule.options` should be validated for this rule. All [JSON Schema](https://json-schema.org/) tools supported by [AJV](https://ajv.js.org/) all available, with a few important caveats:

- The file itself should always be named `<rule-name>-config.json` and be located under the `rules` folder.
- The top-level type should always be `object`.
- The `$id` field should be an absolute raw.githubusercontent.com URL to where the schema is hosted on GitHub (ex. https://raw.githubusercontent.com/todogroup/repolinter/master/rules/apache-notice-config.json). This allows IDEs such as VSCode to apply the schema via a URL.

To get started, you can use the following template:

```JSON
{
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://raw.githubusercontent.com/todogroup/repolinter/master/rules/<rule-name>-config.json",
    "type": "object",
    "properties": {}
}
```

Due to limitations with JSON Schema, you also must register your rule configuration schema in [rulesets/schema.json](../../rulesets/schema.json) by adding the following item to the list under `root.then.properties.rules.properties.rule.allOf`:

```JSON
{ "if": { "properties": { "type": { "const": "<rule-name>" } } }, "then": { "properties": { "options": { "$ref": "../rules/<rule-name>-config.json" } } } }
```

### JavaScript Implementation

A rule implementation consists of a module with the following interface:

```TypeScript
async (fs: FileSystem, opts /* type determined by your JSON schema */) => Result
```

Where fs is a [`FileSystem`](../../lib/file_system.js) scoped to the current repository and `opts` is the options provided by the ruleset.

A rule implementation is encouraged to use `Result#targets` to show the individual files/patterns checked when processing the rule. Including filenames in `Result#message` is discouraged as it makes formatting difficult. If a rule fails to execute, it should throw an error.

## Fixes

A fix, similar to a rule, consists of two parts: a JavaScript module, which determines the fix's functionality and a JSON schema, which validates the fix's configuration options in rulesets. Fixes are registered in [fixes/fixes.js](../../fixes/fixes.js) and [rulesets/schema.json](../../rulesets/schema.json). Fixes are also documented under [fixes.md](./fixes.md).

### Fix Configuration JSON Schema

Fix JSON schemas work identically to [rule JSON schemas](#rule-configuration-json-schema), with the only difference the respective names and paths.

To get started, you can use the following template:

```JSON
{
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://raw.githubusercontent.com/todogroup/repolinter/master/fixes/<fix-name>-config.json",
    "type": "object",
    "properties": {}
}
```

Similar as with rules, you must register the fix schema in [rulesets/schema.json](../../rulesets/schema.json) by adding the following item to the list under `root.then.properties.rules.properties.fix.allOf` (note that this is a different list than the rule registration list):

```JSON
{ "if": { "properties": { "type": { "const": "<fix-name>" } } }, "then": { "properties": { "options": { "$ref": "../rules/<fix-name>-config.json" } } } }
```

### JavaScript Implementation

Unlike rules, a fix implementation consists of a module with the following interface:

```TypeScript
async (fs: FileSystem, options /* Type determined by your JSON schema */, targets: string[], dryRun: boolean) => Result
```

Where fs is a [`FileSystem`](../../lib/file_system.js) scoped to the current repository, `opts` is the options provided by the ruleset, `targets` are filepaths which did not pass the rule associated with this fix, and `dryRun` determines if the fix is allowed to make changes to the repository.

The fix implementation is encouraged to use `Result#targets` to show the individual files/patterns changed. If the fix fails to execute, it should either return a failed result or throw an error.

## Formatters

Formatters are exported by [index.js](../../index.js) and manually called by the [CLI](../../bin/repolinter.js). A formatter implementation consists of the following interface:

```TypeScript
interface Formatter {
  formatOutput(output: LintResult, dryRun: boolean): string
}
```

Formatters do not print to `STDOUT` instead choosing to return the output as a string.

If needed, a formatter can accept extra configuration from the ruleset through the `formatOptions` property, which will be directly passed through to `LintResult#formatOptions`. These options are not typed and are formatter dependent.
