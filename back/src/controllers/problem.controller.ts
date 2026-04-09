import { Request, Response } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAllProblems = async (req: Request, res: Response) => {
    try {
        const [problems] = await pool.query(`SELECT * FROM problems`);
        return res.json({ problems });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllSamplesByProblem = async (req: Request, res: Response) => {
    try {
        const [samples] = await pool.query(`SELECT * FROM samples WHERE problem_id = ?`, [req.params.id]);
        return res.json({ problems: samples }); // Frontend expects the key 'problems' for samples too
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getSkeletonCodeByProblem = async (req: Request, res: Response) => {
    try {
        const { id, language } = req.params;
        const [skeletons] = await pool.query<any[]>(`
            SELECT s.code, l.file_extension, p.short_title
            FROM skeletons s
            JOIN languages l ON s.language = l.key
            JOIN problems p ON s.problem_id = p.id
            WHERE problem_id = ? AND language = ?
        `, [id, language]);
        
        if (skeletons.length === 0) return res.status(404).send("Skeleton not found");

        // Set appropriate headers to send as a blob/file
        res.setHeader('Content-disposition', `attachment; filename=skeleton_${skeletons[0].short_title}.${skeletons[0].file_extension}`);
        res.setHeader('Content-type', 'text/plain');
        return res.send(skeletons[0].code);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllLanguages = async (req: Request, res: Response) => {
    try {
        const [languages] = await pool.query(`SELECT * FROM languages`);
        return res.json({ languages });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllStatuses = async (req: Request, res: Response) => {
    try {
        const [statuses] = await pool.query(`SELECT * FROM statuses`);
        return res.json({ statuses });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserInfoByProblem = async (req: AuthRequest, res: Response) => {
    try {
        const problemId = req.params.id;
        const userId = req.user_id;

        // Fetch number of tries
        const [triesResult] = await pool.query<any[]>(`SELECT COUNT(*) as number_tries FROM submits WHERE problem_id = ? AND user_id = ?`, [problemId, userId]);
        
        const [statusSolved] = await pool.query<any[]>(`
            SELECT status_id
            FROM submits
            WHERE problem_id = ? AND user_id = ? AND status_id = 1
            LIMIT 1
        `, [problemId, userId]);

        if (statusSolved.length > 0) {
            return res.json({ status: 1, number_tries: triesResult[0].number_tries });
        }
        
        const [statusResult] = await pool.query<any[]>(`
            SELECT status_id
            FROM submits
            WHERE problem_id = ? AND user_id = ? 
            ORDER BY submited_on DESC
            LIMIT 1
        `, [problemId, userId]);

        const status = statusResult.length > 0 ? statusResult[0].status_id : -1;
        const number_tries = triesResult[0].number_tries;

        return res.json({ status, number_tries });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllSubmitsByProblem = async (req: AuthRequest, res: Response) => {
    try {
        const problemId = req.params.id;
        const userId = req.user_id;
        const [submits] = await pool.query(`SELECT * FROM submits WHERE problem_id = ? AND user_id = ?`, [problemId, userId]);
        return res.json({ submits });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
