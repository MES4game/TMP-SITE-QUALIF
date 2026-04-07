import { Controller, Get, Post, Put, Delete, Route, Tags, Security, Request, Path } from 'tsoa';
import * as express from 'express';
import prisma from '../utils/prisma';
@Route('user')
@Tags('User')
export class UserController extends Controller {
    @Security('jwt')
    @Get('self')
    async getSelf(
    @Request()
    req) {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, pseudo: true, firstname: true, lastname: true, created_on: true, last_connection: true, deleted_on: true, verified_email: true }
        });
        return { user };
    }
    @Security('jwt')
    @Post('self')
    async updateUser(
    @Request()
    req, 
    @Body()
    updates) {
        const userId = req.user.id;
        await prisma.user.update({
            where: { id: userId },
            data: updates
        });
        return { message: "Updated successfully" };
    }
    @Get('pseudo/{id}')
    async getPseudo(
    @Path()
    id) {
        const user = await prisma.user.findUnique({ where: { id }, select: { pseudo: true } });
        if (!user)
            throw new Error("User not found");
        return { pseudo: user.pseudo };
    }
}
//# sourceMappingURL=user.controller.js.map