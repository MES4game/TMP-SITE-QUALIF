import { Request, Response } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middlewares/auth.middleware';
import fs from 'fs';
import { getProblemDescriptionPath, getProblemSamplesPaths, getProblemSkeletonCodePath } from '../config';

export const getAllProblems = async (req: Request, res: Response) => {
    try {
        const [problems] = await pool.query<any[]>(`SELECT * FROM problems`);
        const problemsWithDescription = problems.map((problem) => {
            const { folder_root, ...rest } = problem;
            const path_fr = getProblemDescriptionPath(rest.short_title, 'FR');
            const path_en = getProblemDescriptionPath(rest.short_title, 'EN');
            const description_fr = fs.existsSync(path_fr) ? fs.readFileSync(path_fr, 'utf-8') : '';
            const description_en = fs.existsSync(path_en) ? fs.readFileSync(path_en, 'utf-8') : '';
            return {
                ...rest,
                description_fr,
                description_en,
            };
        });
        return res.json({ problems: problemsWithDescription });
    } catch (error) {
        console.error("Error fetching problems:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllSamplesByProblem = async (req: Request, res: Response) => {
    try {
        if (!req.params.id) return res.status(400).json({ message: "Problem ID is required" });
        if (typeof req.params.id !== 'string') return res.status(400).json({ message: "Problem ID must be an integer" });

        const [problems] = await pool.query<any[]>(`SELECT * FROM problems WHERE id = ?`, [req.params.id]);

        if (problems.length === 0) {
            return res.status(404).json({ message: "Problem not found" });
        }

        const samples = getProblemSamplesPaths(problems[0].short_title).map((samplePath, idx) => {
            const input = fs.existsSync(`${samplePath}.in`) ? fs.readFileSync(`${samplePath}.in`, 'utf-8') : '';
            const output = fs.existsSync(`${samplePath}.out`) ? fs.readFileSync(`${samplePath}.out`, 'utf-8') : '';
            const explanation_fr = fs.existsSync(`${samplePath}_FR.md`) ? fs.readFileSync(`${samplePath}_FR.md`, 'utf-8') : '';
            const explanation_en = fs.existsSync(`${samplePath}_EN.md`) ? fs.readFileSync(`${samplePath}_EN.md`, 'utf-8') : '';

            return {
                id: idx,
                input,
                output,
                explanation_fr,
                explanation_en,
            };
        });

        return res.json({ samples });
    } catch (error) {
        console.error("Error fetching problems:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getSkeletonCodeByProblem = async (req: Request, res: Response) => {
    try {
        const { id, language } = req.params;

        const [languages] = await pool.query<any[]>(`
            SELECT file_extension
            FROM languages
            WHERE \`key\` = ?
        `, [language]);

        if (languages.length === 0) return res.status(400).json({ message: "Language not found" });

        const [problems] = await pool.query<any[]>(`
            SELECT short_title
            FROM problems
            WHERE id = ?
        `, [id]);

        if (problems.length === 0) return res.status(400).json({ message: "Problem not found" });

        const file_extension = languages[0].file_extension;
        const short_title = problems[0].short_title;

        const skeletonPath = getProblemSkeletonCodePath(short_title, file_extension);
        const customFileName = `skeleton_${short_title}.${file_extension}`;

        if (!fs.existsSync(skeletonPath)) {
            return res.status(404).json({ message: "Skeleton code not found for the specified problem and language" });
        }

        return res.download(skeletonPath, customFileName, (err) => {
            if (err) {
                console.error("Error downloading file:", err);
                if (!res.headersSent) {
                    res.status(500).json({ message: "Error downloading the file" });
                }
            }
        });
    } catch (error) {
        console.error("Error fetching problems:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllLanguages = async (req: Request, res: Response) => {
    try {
        const [languages] = await pool.query(`SELECT * FROM languages`);
        return res.json({ languages });
    } catch (error) {
        console.error("Error fetching problems:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllStatuses = async (req: Request, res: Response) => {
    try {
        const [statuses] = await pool.query(`SELECT * FROM statuses`);
        return res.json({ statuses });
    } catch (error) {
        console.error("Error fetching problems:", error);
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
        console.error("Error fetching problems:", error);
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
        console.error("Error fetching problems:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
