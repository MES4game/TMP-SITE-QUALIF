import * as express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export function expressAuthentication(
    request: express.Request,
    securityName: string,
    scopes?: string[]
): Promise<any> {
    if (securityName === 'jwt') {
        const authHeader = request.headers['authorization'];
        const token = authHeader?.split(' ')[1];

        return new Promise((resolve, reject) => {
            if (!token) return reject(new Error('No token provided'));
            jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
                if (err) return reject(new Error('Invalid token'));
                resolve(decoded); // This will be injected into endpoints requesting the user info
            });
        });
    }
    return Promise.reject(new Error('Unknown security type'));
}
