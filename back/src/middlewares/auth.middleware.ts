import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config';

// Extend Express Request to include user_id
export interface AuthRequest extends Request {
    user_id?: number;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { id: number };
        req.user_id = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Token expired or invalid" });
    }
};