import FormatResult from "./lib/formatresult";
import Result from "./lib/result";
import RuleInfo from "./lib/ruleinfo";
import FileSystem from "./lib/file_system";

export interface LintResult {
    params: { targetDir: string, filterPaths: string[], rulesetPath?: string, ruleset: any }
    passed: boolean
    errored: boolean
    errMsg?: string
    results: FormatResult
    targets: { [key: string]: Result }
}

export interface Formatter {
    formatOutput(output: LintResult, dryRun: boolean): string
}

export declare function lint(targetDir: string, filterPaths?: string[], dryRun?: boolean, ruleset?: any): Promise<LintResult>
export declare function runRuleset(ruleset: RuleInfo[], targets: boolean|{ [key: string]: Result }, dryRun: boolean, self_dir?: string): Promise<FormatResult[]>
export declare function determineTargets(axiomconfig: any, fs: FileSystem, self_dir?: string): Promise<{ [key: string]: Result }>
export declare function validateConfig(config: any, self_dir?: string): Promise<{ passed: boolean, error?: string }>
export declare function parseConfig(config: any): RuleInfo[]

export declare const defaultFormatter: Formatter
export declare const jsonFormatter: Formatter
export declare const resultFormatter: Formatter