import { Request, Response } from 'express';
import { pool } from '../db';
import { env } from '../config';

export const getScoreboard = async (req: Request, res: Response) => {
    try {
        const startDate = env.START_DATE.toISOString().slice(0, 19).replace('T', ' ');
        const freezeDate = env.FREEZE_DATE.toISOString().slice(0, 19).replace('T', ' ');

        // Pure SQL query to calculate everything according to your rules
        const query = `
            WITH FirstSolved AS (
                SELECT 
                    user_id, 
                    problem_id, 
                    MIN(submited_on) as solved_time
                FROM submits
                WHERE status_id = 1 
                  AND submited_on >= ? 
                  AND submited_on <= ?
                GROUP BY user_id, problem_id
            ),
            TriesCount AS (
                SELECT 
                    s.user_id, 
                    s.problem_id, 
                    COUNT(s.id) as nb_tries
                FROM submits s
                JOIN FirstSolved fs 
                  ON s.user_id = fs.user_id AND s.problem_id = fs.problem_id
                WHERE s.submited_on >= ? 
                  AND s.submited_on <= fs.solved_time
                GROUP BY s.user_id, s.problem_id
            )
            SELECT 
                tc.user_id, 
                tc.problem_id, 
                tc.nb_tries, 
                TIMESTAMPDIFF(MINUTE, ?, fs.solved_time) as time_solved
            FROM TriesCount tc
            JOIN FirstSolved fs 
              ON tc.user_id = fs.user_id AND tc.problem_id = fs.problem_id;
        `;

        // Pass dates: 1: Start, 2: Freeze, 3: Start, 4: Start (for time_solved difference calculation)
        const [rows] = await pool.query<any[]>(query, [startDate, freezeDate, startDate, startDate]);

        // Map the flat SQL results to the nested JSON structure expected by front: { user_id: X, problems: [...] }
        const scoreboardMap = new Map<number, any>();

        for (const row of rows) {
            if (!scoreboardMap.has(row.user_id)) {
                scoreboardMap.set(row.user_id, {
                    user_id: row.user_id,
                    problems: []
                });
            }
            
            scoreboardMap.get(row.user_id).problems.push({
                problem_id: row.problem_id,
                nb_tries: row.nb_tries,
                time_solved: row.time_solved
            });
        }

        return res.json({ scores: Array.from(scoreboardMap.values()) });
    } catch (error) {
        console.error("Scoreboard Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
