import { Response } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middlewares/auth.middleware';
import path from 'path';
import fs from 'fs';
import { CODE_DIR } from '../middlewares/upload.middleware';

export const getCodeBySubmitId = async (req: AuthRequest, res: Response) => {
    try {
        const submitId = req.params.id;
        const userId = req.user_id;

        const [submits] = await pool.query<any>(`
            SELECT s.code_path, l.file_extension, p.short_title
            FROM submits s
            JOIN languages l ON s.language = l.key
            JOIN problems p ON s.problem_id = p.id
            WHERE s.id = ? AND s.user_id = ? 
        `, [submitId, userId]); 

        if (submits.length === 0) {
            return res.status(404).json({ message: "Submission not found" });
        }

        const submission = submits[0];
        const absolutePath = path.join(CODE_DIR, submission.code_path);
        const customFileName = `submit_${submitId}_${submission.short_title}.${submission.file_extension}`;

        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ message: "File no longer exists on the server" });
        }

        return res.download(absolutePath, customFileName, (err) => {
            if (err) {
                console.error("Error downloading file:", err);
                if (!res.headersSent) {
                    res.status(500).json({ message: "Error downloading the file" });
                }
            }
        });
    } catch (error) {
        console.error("Server error in getCodeBySubmitId:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export const submitSolution = async (req: AuthRequest, res: Response) => {
    try {
        const { problem, language } = req.params;

        // Validate input
        if (!problem || !language) {
            return res.status(400).json({ message: "Missing problem or language" });
        }

        if ((await pool.query<any[]>(`SELECT * FROM problems WHERE id = ?`, [problem]))[0].length === 0) {
            return res.status(404).json({ message: "Problem not found" });
        }
        if ((await pool.query<any[]>(`SELECT * FROM languages WHERE \`key\` = ?`, [language]))[0].length === 0) {
            return res.status(404).json({ message: "Language not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file provided." });
        }

        const [statuses] = await pool.query<any>(`SELECT COUNT(*) as nb FROM statuses`);

        const [submit] = await pool.query(`
            INSERT INTO submits (problem_id, user_id, language, status_id, code_path)
            VALUES (?, ?, ?, ?, ?)
        `, [problem, req.user_id, language, getRandomInt(statuses[0].nb ?? 0) + 1, req.file.filename]);

        // TODO: Trigger evaluation process here (e.g., via message queue or background worker)

        return res.json({ message: "Submission received" });
    } catch (error) {
        console.error("Error fetching problems:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
