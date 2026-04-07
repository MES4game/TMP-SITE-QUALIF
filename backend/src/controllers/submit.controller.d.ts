import { Controller } from 'tsoa';
import * as express from 'express';
export declare class SubmitController extends Controller {
    getSubmitsByProblem(problem_id: number, req: express.Request): Promise<{
        user: any;
    }>;
    getSubmitById(id: number, req: express.Request): Promise<{
        user: any;
    }>;
}
//# sourceMappingURL=submit.controller.d.ts.map