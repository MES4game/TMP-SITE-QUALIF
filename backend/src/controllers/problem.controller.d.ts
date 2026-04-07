import { Controller } from 'tsoa';
import * as express from 'express';
export declare class ProblemController extends Controller {
    getAllProblems(): Promise<{
        problems: any[];
    }>;
    getUserInfo(id: number, req: express.Request): Promise<{
        status: string;
        number_tries: number;
    }>;
    getSamples(id: number): Promise<{
        problems: any[];
    }>;
    getSkeletonCode(id: number, language: string): Promise<string>;
    getLanguages(): Promise<{
        languages: any[];
    }>;
    getSubmits(id: number, req: express.Request): Promise<{
        submits: any[];
        status: string;
    }>;
}
//# sourceMappingURL=problem.controller.d.ts.map