export interface RunCodeParams {
    userId: number;
    problemId: number;
    language: string;
    code: string;
}
/**
 * Placeholder service for running submitted code against problem samples.
 */
export declare function executeCodeSubmission(params: RunCodeParams): Promise<void>;
//# sourceMappingURL=runner.service.d.ts.map