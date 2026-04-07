import { Controller, Get, Route, Tags, Path, Security, Request, Produces } from 'tsoa';
import * as express from 'express';
import prisma from '../utils/prisma';
@Route('problem')
@Tags('Problem')
export class ProblemController extends Controller {
    @Get('all')
    async getAllProblems() {
        const problems = await prisma.problem.findMany();
        return { problems };
    }
    @Security('jwt')
    @Get('{id}/user-info')
    async getUserInfo(
    @Path()
    id, 
    @Request()
    req) {
        const userId = req.user.id;
        const submits = await prisma.submit.findMany({
            where: { user_id: userId, problem_id: id },
            orderBy: { submited_on: 'asc' }
        });
        const firstSolvedIndex = submits.findIndex(s => s.status === "SOLVED");
        let status = "-";
        let number_tries = submits.length;
        if (firstSolvedIndex !== -1) {
            status = "SOLVED";
            number_tries = firstSolvedIndex;
        }
        else if (submits.some(s => s.status === "ERROR")) {
            status = "ERROR";
        }
        return { status, number_tries };
    }
    @Get('{id}/samples')
    async getSamples(
    @Path()
    id) {
        // Note: Your frontend expects the key to be "problems" even though it contains samples
        const samples = await prisma.sample.findMany({
            where: { problem_id: id }
        });
        return { problems: samples };
    }
    @Get('{id}/skeleton/{language}')
    @Produces('text/plain')
    async getSkeletonCode(
    @Path()
    id, 
    @Path()
    language) {
        // You can later fetch this from DB or file system
        if (language === 'python') {
            return "def solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()";
        }
        if (language === 'cpp') {
            return "#include <iostream>\n\nint main() {\n    // Write your code here\n    return 0;\n}";
        }
        return "// Write your code here";
    }
    @Get('languages')
    async getLanguages() {
        return {
            languages: [
                { key: "cpp", label: "C++" },
                { key: "python", label: "Python 3" },
                { key: "java", label: "Java" },
                { key: "javascript", label: "Node.js" }
            ]
        };
    }
    @Security('jwt')
    @Get('{id}/submits')
    async getSubmits(
    @Path()
    id, 
    @Request()
    req) {
        const userId = req.user.id;
        const submits = await prisma.submit.findMany({
            where: { user_id: userId, problem_id: id },
            orderBy: { submited_on: 'desc' }
        });
        // The frontend api calls this endpoint twice: 
        // 1. getAllSubmitsByProblem expects `{ submits: [...] }`
        // 2. getStatusBySubmit expects `{ status: "..." }`
        // We return both in the same payload to satisfy both calls.
        const status = submits.some(s => s.status === "SOLVED") ? "SOLVED"
            : submits.some(s => s.status === "ERROR") ? "ERROR"
                : "-";
        // Map Prisma model to frontend Submit model
        const mappedSubmits = submits.map(s => ({
            submit_id: s.id,
            language: s.language,
            status: s.status,
            submited_on: s.submited_on
        }));
        return { submits: mappedSubmits, status };
    }
}
//# sourceMappingURL=problem.controller.js.map