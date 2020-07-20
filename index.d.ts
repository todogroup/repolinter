declare class FileSystem {
    targetDir: string
    filterPaths: string[]
    
    static fileExists(file: string): Promise<boolean>
    relativeFileExists(file: string): Promise<boolean>
    getFilterFiles(): string[]
    getFilterDirectories(): string[]
    findFirst(globs: string | string[], nocase?: boolean): Promise<undefined | string>
    findFirstFile(globs: string | string[], nocase?: boolean): Promise<undefined | string>
    findAllFiles(globs: string | string[], nocase?: boolean): Promise<undefined | string[]>
    glob(globs: string | string[], options: any): Promise<string[]>
    findAll(globs: string | string[], nocase?: boolean): Promise<undefined | string[]>
    isBinaryFile(relativeFile: string): Promise<boolean>
    shouldInclude(path: string): boolean
    getFileContents(relativeFile: string): Promise<string | undefined>
    setFileContents(relativeFile: string, contents: string): Promise<any>
    getFileLines(relativeFile: string, lineCount: number): Promise<string>
}

declare class Result {
    message?: string
    targets: Array<{ path: string, passed: boolean, message?: string }>
    passed: boolean
}

declare class RuleInfo {
    name: string
    level: "off"|"error"|"warning"
    where?: string[]
    ruleType: string
    ruleConfig: any
    fixType?: string
    fixConfig: any
}

declare class FormatResult {
    status: string
    runMessage?: string
    lintResult?: Result
    fixResult?: Result
    ruleInfo: RuleInfo
}

declare class LintResult {
    params: { targetDir: string, filterPaths: string[], rulesetPath?: string, ruleset: any }
    passed: boolean
    errored: boolean
    errMsg?: string
    results: FormatResult
    targets: { [key: string]: Result | null }
}

declare interface Formatter {
    formatOutput(output: LintResult, dryRun: boolean): string
}

export declare function lint(targetDir: string, filterPaths?: string[], dryRun?: boolean, ruleset?: any): Promise<LintResult>
export declare function runRuleset(ruleset: RuleInfo[], targets: boolean|{ [key: string]: Result | null }, dryRun: boolean): Promise<FormatResult[]>
export declare function determineTargets(axiomconfig: any, fs: FileSystem): Promise<{ [key: string]: Result | null }>
export declare function validateConfig(config: any): Promise<{ passed: boolean, error?: string }>
export declare function parseConfig(config: any): RuleInfo[]

export declare const defaultFormatter: Formatter
export declare const jsonFormatter: Formatter
export declare const resultFormatter: Formatter