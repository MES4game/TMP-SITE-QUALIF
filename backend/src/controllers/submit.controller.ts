import { Controller, Get, Route, Tags, Path, Security, Request } from 'tsoa';
import * as express from 'express';
import prisma from '../utils/prisma';

@Route('submit')
@Tags('Submit')
export class SubmitController extends Controller {
    
    // Frontend submit.api.ts `getAllUserSubmitsByProblem` expects a User object.
    @Security('jwt')
    @Get('byProblem/{problem_id}')
    public async getSubmitsByProblem(
        @Path() problem_id: number,
        @Request() req: express.Request
    ): Promise<{ user: any }> {
        const userId = (req as any).user.id;
        
        // Fetch user and include their submits for this problem
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                submits: {
                    where: { problem_id }
                }
            }
        });

        if (!user) throw new Error("User not found");
        return { user };
    }

    // Frontend submit.api.ts `getSubmitById` expects a User object.
    @Security('jwt')
    @Get('{id}')
    public async getSubmitById(
        @Path() id: number,
        @Request() req: express.Request
    ): Promise<{ user: any }> {
        const userId = (req as any).user.id;
        
        // Ensure the submit belongs to the requesting user
        const submit = await prisma.submit.findUnique({
            where: { id }
        });

        if (!submit || submit.user_id !== userId) {
            this.setStatus(404);
            throw new Error("Submit not found");
        }

        // Return the user as expected by frontend
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        return { user };
    }
}
