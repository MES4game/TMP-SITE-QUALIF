import { Controller } from 'tsoa';
import * as express from 'express';
export declare class UserController extends Controller {
    getSelf(req: express.Request): Promise<{
        user: any;
    }>;
    updateUser(req: express.Request, updates: any): Promise<{
        message: string;
    }>;
    getPseudo(id: number): Promise<{
        pseudo: string;
    }>;
}
//# sourceMappingURL=user.controller.d.ts.map