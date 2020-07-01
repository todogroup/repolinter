
const Result = require('./result');
const RuleInfo = require('./ruleinfo');

class FormatResult {
    /**
     * 
     * @private
     * @param {RuleInfo} ruleInfo Information about the rule
     * @param {string?} message Message from the engine indicating why the rule may have been excluded. must be null if lintRes is present.
     * @param {string} status The "status" (error, ignored, ok) code, based on static values in FormatResult
     * @param {Result?} lintRes The linter rule output
     * @param {Result?} fixRes The fixer rule output
     */
    constructor(ruleInfo, message, status, lintRes, fixRes) {
        /** @private */
        this.ruleInfo = ruleInfo;
        /** @private */
        this.message = message || null;
        /** @private */
        this.status = status;
        /** @private */
        this.lintRes = lintRes || null;
        /** @private */
        this.fixRes = fixRes || null;
    }


    /**
     * Create a FormatResult for an ignored rule
     * 
     * @param {RuleInfo} ruleInfo Information about the rule
     * @param {string} message Why the rule was ignored
     * @returns {FormatResult} A FormatResult object
     */
    static CreateIgnored(ruleInfo, message) {
        return new FormatResult(ruleInfo, message, FormatResult.IGNORED, null, null);
    }

    /**
     * Create a FormatResult for a rule that threw an error
     * 
     * @param {RuleInfo} ruleInfo Information about the rule
     * @param {string} message Why the rule errored
     * @returns {FormatResult} A FormatResult object
     */
    static CreateError(ruleInfo, message) {
        return new FormatResult(ruleInfo, message, FormatResult.ERROR, null, null);
    }

    /**
     * Create a FormatResult for a rule that only contains
     * output from a lint rule
     * 
     * @param {RuleInfo} ruleInfo Information about the rule
     * @param {Result} lintRes The result from the linter rule
     * @returns {FormatResult} A FormatResult object
     */
    static CreateLintOnly(ruleInfo, lintRes) {
        return new FormatResult(ruleInfo, null, FormatResult.OK, lintRes, null);
    }

    /**
     * Create a FormatResult for a rule that contains output
     * from both a lint and fix job.
     * 
     * @param {RuleInfo} ruleInfo Information about the rule
     * @param {Result} lintRes The result from the lint rule
     * @param {Result} fixRes The result from the fix rule
     * @returns {FormatResult} A FormatResult object
     */
    static CreateLintAndFix(ruleInfo, lintRes, fixRes) {
        return new FormatResult(ruleInfo, null, FormatResult.OK, lintRes, fixRes);
    }

    /** @returns {string} The status of the rule execution, either FormatResult.OK, FormatResult.IGNORED, or FormatResult.ERROR */
    getStatus() { return this.status; }
    /** @returns {string?} a message why the rule was ignored or failed, or null if the rule ran */
    getMessage() { return this.message; }
    /** @returns {Result?} the linter result object, or null if the rule was ignored */
    getLintResult() { return this.lintRes; }
    /** @returns {Result?} the fix result object, or null if no fix was present or the rule was ignored */
    getFixResult() { return this.fixRes; }
}

FormatResult.OK = 'OK';
FormatResult.IGNORED = 'IGNORED';
FormatResult.ERROR = 'ERROR';

module.exports = FormatResult;