import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
// Import your AuthRequest interface from wherever it is defined
import { AuthRequest } from './auth.middleware'; 

export const userRateLimiter = (minutes: number, maxRequests: number) => {
    return rateLimit({
        windowMs: minutes * 60 * 1000, // Convert minutes to milliseconds
        max: maxRequests, // Limit each user to 'maxRequests' per 'windowMs'
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        
        // This is the magic part: overriding the default IP check
        keyGenerator: (req: Request): string => {
            const authReq = req as AuthRequest;
            
            // If the user_id exists (thanks to requireAuth), use it as the key.
            if (authReq.user_id) {
                return `user_${authReq.user_id.toString()}`;
            }
            
            // Fallback to IP address if for some reason user_id is missing
            return req.ip || 'unknown_ip';
        },

        // Custom JSON response when the limit is reached
        handler: (req: Request, res: Response) => {
            res.status(429).json({ 
                message: "Too many requests. Please try again later." 
            });
        }
    });
};
