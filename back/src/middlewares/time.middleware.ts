import { Request, Response, NextFunction } from 'express';
import { env } from '../config';

export const requireCompetitionStarted = (req: Request, res: Response, next: NextFunction) => {
    const now = new Date();
    if (now < env.START_DATE) {
        // Return nothing if asked for problems info before start date
        return res.status(200).json({ problems: [] }); 
    }
    next();
};