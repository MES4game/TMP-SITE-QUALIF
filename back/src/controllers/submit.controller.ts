import { Response } from 'express';
import { pool } from '../db';
import { AuthRequest } from '../middlewares/auth.middleware';
import path from 'path';
import fs from 'fs';
import { CODE_DIR } from '../middlewares/upload.middleware';
import { executeProblem, getCachedProblemMap, ParseProblemLanguage, ProblemLanguage } from '../utils/runner.util';
import { ResultSetHeader } from 'mysql2';
import { env } from '../config';

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



const queue: { submit_id: number, code: string, language: ProblemLanguage, problem_folder: string, resolve: () => void }[] = [];
let activeJobs: number = 0;

async function processQueue(): Promise<void> {
    if (queue.length > 0 && activeJobs < env.MAX_CONCURRENT_JOBS) {
        const job = queue.shift()!;
        activeJobs += 1;

        pool.query(`UPDATE submits SET status_id = 2 WHERE id = ?`, [job.submit_id]);

        executeProblem(job.code, job.language, job.problem_folder)
            .then((result) => {
                console.log("Execution result for submit_id", job.submit_id, ":", JSON.stringify(result, null, 4));
                // Parse result and update submission status in the database accordingly
                pool.query(`UPDATE submits SET status_id = 9 WHERE id = ?`, [job.submit_id]);
            })
            .catch((error) => {
                console.error("Error executing problem for submit_id", job.submit_id, ":", error);
                pool.query(`UPDATE submits SET status_id = 7 WHERE id = ?`, [job.submit_id]);
            })
            .finally(() => {
                job.resolve();
                activeJobs -= 1;
                processQueue();
            });
    }
}

function addToQueue(submit_id: number, code: string, language: ProblemLanguage, problem_folder: string): Promise<void> {
    return new Promise<void>((resolve) => {
        queue.push({ submit_id, code, language, problem_folder, resolve });
        processQueue();
    });
}

export const submitSolution = async (req: AuthRequest, res: Response) => {
    try {
        const { problem, language } = req.params;

        // Validate input
        if (!problem || !language || typeof problem !== 'string' || typeof language !== 'string') {
            return res.status(400).json({ message: "Missing problem or language" });
        }

        const [problems] = await pool.query<any[]>(`SELECT * FROM problems WHERE id = ?`, [problem])
        
        if (problems.length === 0) {
            return res.status(404).json({ message: "Problem not found" });
        }
        if ((await pool.query<any[]>(`SELECT * FROM languages WHERE \`key\` = ?`, [language]))[0].length === 0) {
            return res.status(404).json({ message: "Language not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file provided." });
        }

        if (!fs.existsSync(path.join(CODE_DIR, req.file.filename))) {
            return res.status(404).json({ message: "Uploaded file not found on server." });
        }

        const fileContent = fs.readFileSync(req.file.path, 'utf-8');

        const [submit] = await pool.query<ResultSetHeader>(`
            INSERT INTO submits (problem_id, user_id, language, status_id, code_path)
            VALUES (?, ?, ?, ?, ?)
        `, [problem, req.user_id, language, 3, req.file.filename]);

        addToQueue(submit.insertId, fileContent, ParseProblemLanguage(language), problems[0].folder_root);

        return res.json({ message: "Submission received" });
    } catch (error) {
        console.error("Error fetching problems:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
