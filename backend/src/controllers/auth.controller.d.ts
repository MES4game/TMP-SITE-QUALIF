import { Controller } from 'tsoa';
export declare class AuthController extends Controller {
    register(body: any): Promise<{
        message: string;
    }>;
    login(body: any): Promise<{
        token: string;
    } | {
        message: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map