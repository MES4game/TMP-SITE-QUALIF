import { Response } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getCodeBySubmitId = async (req: AuthRequest, res: Response) => {
    try {
        const submitId = req.params.id;
        const userId = req.user_id;

        // Fetch the code of the submission from the database
        const [submits] = await pool.query<any>(`
            SELECT s.code, l.file_extension, p.short_title
            FROM submits s
            JOIN languages l ON s.language = l.key
            JOIN problems p ON s.problem_id = p.id
            WHERE id = ? AND user_id = ?
        `, [submitId, userId]);

        if (submits.length === 0) return res.status(404).json({ message: "Submission not found" });

        // Return the code as a file/blob
        res.setHeader('Content-disposition', `attachment; filename=submit_${submitId}_${submits[0].short_title}.${submits[0].file_extension}`);
        res.setHeader('Content-type', 'text/plain');
        return res.send(submits[0].code);
    } catch (error) {
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

        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "No file provided." });
        }

        const buffer = file.buffer;
        const fileString = buffer.toString('utf-8');
        
        if (fileString.includes('\uFFFD')) {
            return res.status(400).json({ message: "Invalid encoding: File must be UTF-8." });
        }

        const user_id = req.user_id;

        const [statuses] = await pool.query<any>(`SELECT COUNT(*) as nb FROM statuses`);

        // Insert the new submission into the database
        const [submit] = await pool.query(`
            INSERT INTO submits (problem_id, user_id, language, status_id, code)
            VALUES (?, ?, ?, ?, ?)
        `, [problem, user_id, language, getRandomInt(statuses[0].nb ?? 0), fileString]);

        return res.json({ message: "Submission received" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
