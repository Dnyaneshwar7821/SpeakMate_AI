export const PASSED_RESULT_STATUSES = new Set(["Excellent", "Good", "Pass"]);

export function isResultPassed(status) {
    return PASSED_RESULT_STATUSES.has(status);
}
