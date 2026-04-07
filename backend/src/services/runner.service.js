import prisma from '../utils/prisma';
/**
 * Placeholder service for running submitted code against problem samples.
 */
export async function executeCodeSubmission(params) {
    const { userId, problemId, language, code } = params;
    console.log(`[Runner] Received submission for Problem ${problemId} from User ${userId} in ${language}`);
    // 1. Create a "PENDING" or "-" submit record immediately
    const submit = await prisma.submit.create({
        data: {
            user_id: userId,
            problem_id: problemId,
            language: language,
            status: "-", // Processing
        }
    });
    // 2. TODO: Implement actual isolated code execution (e.g., via Docker, VM, or Pterodactyl)
    // - Fetch Problem limits (time_limit, memory_limit)
    // - Fetch Problem samples/testcases
    // - Write code to temp file
    // - Compile & Run
    // - Compare outputs
    // Simulate processing delay
    setTimeout(async () => {
        // 3. Update the submit with the final result
        // Randomly assign SOLVED or ERROR for testing purposes
        const isSuccess = Math.random() > 0.5;
        await prisma.submit.update({
            where: { id: submit.id },
            data: { status: isSuccess ? "SOLVED" : "ERROR" }
        });
        console.log(`[Runner] Finished processing Submit ${submit.id}. Result: ${isSuccess ? 'SOLVED' : 'ERROR'}`);
    }, 2000);
}
//# sourceMappingURL=runner.service.js.map