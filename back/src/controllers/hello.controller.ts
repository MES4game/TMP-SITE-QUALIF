import { Controller, Get, Route, SuccessResponse } from "tsoa";

interface HelloResponse {
    message: string;
}

@Route("hello")
export class HelloController extends Controller {
    /**
     * Returns a greeting message. This comment will appear in your OpenAPI docs!
     */
    @Get()
    @SuccessResponse("200", "OK")
    public async getGreeting(): Promise<HelloResponse> {
        return {
            message: "Hello, World!",
        };
    }
}
