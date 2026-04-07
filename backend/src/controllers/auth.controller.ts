import { Controller, Post, Body, Route, Tags, SuccessResponse } from 'tsoa';
import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

@Route('auth')
@Tags('Auth')
export class AuthController extends Controller {
    @Post('register')
    @SuccessResponse('201', 'Created')
    public async register(@Body() body: any): Promise<{ message: string }> {
        const { pseudo, email, firstname, lastname, password } = body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: { pseudo, email, firstname, lastname, password: hashedPassword }
        });

        this.setStatus(201);
        return { message: "User registered successfully" };
    }

    @Post('login')
    public async login(@Body() body: any): Promise<{ token: string } | { message: string }> {
        const { user_login, password } = body;
        
        // Frontend sends `user_login` which might be pseudo or email
        const user = await prisma.user.findFirst({
            where: { OR: [{ email: user_login }, { pseudo: user_login }] }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            this.setStatus(401);
            return { message: "Invalid credentials" };
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
        
        await prisma.user.update({
            where: { id: user.id },
            data: { last_connection: new Date() }
        });

        return { token };
    }
}
