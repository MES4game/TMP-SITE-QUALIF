import { Controller, Get, Post, Put, Delete, Route, Tags, Security, Request, Path } from 'tsoa';
import * as express from 'express';
import prisma from '../utils/prisma';

@Route('user')
@Tags('User')
export class UserController extends Controller {
    @Security('jwt')
    @Get('self')
    public async getSelf(@Request() req: express.Request): Promise<{ user: any }> {
        const userId = (req as any).user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, pseudo: true, firstname: true, lastname: true, created_on: true, last_connection: true, deleted_on: true, verified_email: true }
        });
        return { user };
    }

    @Security('jwt')
    @Post('self')
    public async updateUser(@Request() req: express.Request, @Body() updates: any): Promise<{ message: string }> {
        const userId = (req as any).user.id;
        await prisma.user.update({
            where: { id: userId },
            data: updates
        });
        return { message: "Updated successfully" };
    }

    @Get('pseudo/{id}')
    public async getPseudo(@Path() id: number): Promise<{ pseudo: string }> {
        const user = await prisma.user.findUnique({ where: { id }, select: { pseudo: true } });
        if (!user) throw new Error("User not found");
        return { pseudo: user.pseudo };
    }

    // Note: Avatar fetching/uploading uses standard express Multer in modern apps. 
    // For TSOA, returning streams/blobs directly or handling multipart form data 
    // requires Express middleware injected at the route level. We can set up the 
    // avatar endpoints later if you want the actual file storage logic.
}