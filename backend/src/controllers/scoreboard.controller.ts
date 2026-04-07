import { Controller, Get, Route, Tags } from 'tsoa';
import prisma from '../utils/prisma';
import { getConfig } from '../config/app.config';

@Route('scoreboard')
@Tags('Scoreboard')
export class ScoreboardController extends Controller {
    @Get()
    public async getScoreboard(): Promise<{ scores: any[] }> {
        const { startDatetime, freezeDatetime } = getConfig();

        // 1. Fetch users
        const users = await prisma.user.findMany({
            select: { id: true }
        });

        // 2. Fetch all valid submits within the event timeframe
        const submits = await prisma.submit.findMany({
            where: {
                submited_on: {
                    gte: startDatetime,
                    lte: freezeDatetime,
                }
            },
            orderBy: { submited_on: 'asc' } // Oldest first
        });

        const scores = users.map(user => {
            const userSubmits = submits.filter(s => s.user_id === user.id);
            
            // Group submits by problem_id
            const problemsMap = new Map<number, any[]>();
            userSubmits.forEach(sub => {
                if (!problemsMap.has(sub.problem_id)) problemsMap.set(sub.problem_id, []);
                problemsMap.get(sub.problem_id)!.push(sub);
            });

            const problemsScore = Array.from(problemsMap.entries()).map(([problem_id, subs]) => {
                const firstSolvedIndex = subs.findIndex(s => s.status === "SOLVED");
                
                let time_solved = -1; // -1 indicates not solved
                let nb_tries = 0;

                if (firstSolvedIndex !== -1) {
                    // Solved!
                    const solvedSubmit = subs[firstSolvedIndex];
                    // Time solved in minutes from start of event
                    time_solved = Math.floor((solvedSubmit.submited_on.getTime() - startDatetime.getTime()) / 60000);
                    // Number of failed tries prior to the first SOLVED
                    nb_tries = firstSolvedIndex; 
                } else {
                    // Not solved, count all tries
                    nb_tries = subs.length;
                }

                return {
                    problem_id,
                    nb_tries,
                    time_solved
                };
            });

            return {
                user_id: user.id,
                problems: problemsScore
            };
        });

        return { scores };
    }
}
