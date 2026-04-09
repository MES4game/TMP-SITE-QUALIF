import express from 'express';
import cors from 'cors';
import { env } from './config';
import { setupSwagger } from './swagger';

// Middlewares
import { requireCompetitionStarted } from './middlewares/time.middleware';
import { requireAuth } from './middlewares/auth.middleware';
import { uploadAvatar, uploadCode } from './middlewares/upload.middleware';

// Controllers
import { getScoreboard } from './controllers/scoreboard.controller';
import { registerUser, loginUser, getSelf, getAvatarById, uploadUserAvatar, deleteAccount, updateSelf, forgotPassword, resetPassword, deleteUserAvatar, verifyEmail, getPseudoById } from './controllers/user.controller';
import { getAllProblems, getAllSamplesByProblem, getSkeletonCodeByProblem, getAllLanguages, getUserInfoByProblem, getAllSubmitsByProblem, getAllStatuses } from './controllers/problem.controller';
import { getCodeBySubmitId, submitSolution } from './controllers/submit.controller';

const app = express();

app.use(cors({ exposedHeaders: ['Content-Disposition'] }));
app.use(express.json());

// Initialize Swagger UI
setupSwagger(app);

// ========================
// AUTHENTICATION ROUTES
// ========================

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pseudo: { type: string }
 *               email: { type: string }
 *               firstname: { type: string }
 *               lastname: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email or pseudo already exists
 */
app.post('/auth/register', registerUser);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify user's email using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: Email verified successfully
 */
app.post('/auth/verify-email', verifyEmail);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_login: { type: string, description: "Email or Pseudo" }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 */
app.post('/auth/login', loginUser);

/**
 * @swagger
 * 
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Password reset link sent if email exists (always returns 200 for security)
 */
app.post('/auth/forgot-password', forgotPassword);

/**
 * @swagger
 * 
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token: { type: string }
 *               new_password: { type: string }
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
app.post('/auth/reset-password', resetPassword);

// ========================
// USER ROUTES
// ========================

/**
 * @swagger
 * /user/self:
 *   get:
 *     summary: Get current authenticated user details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user object
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Update current authenticated user details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname: { type: string }
 *               lastname: { type: string }
 *               pseudo: { type: string }
 *     responses:
 *       200:
 *         description: User updated successfully
 *   delete:
 *     summary: Delete the current authenticated account (soft delete)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */
app.get('/user/self', requireAuth, getSelf);
app.post('/user/self', requireAuth, updateSelf);
app.delete('/user/self', requireAuth, deleteAccount);


/**
 * @swagger
 * 
 * /user/self/avatar:
 *   put:
 *     summary: Upload a new avatar for the user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *   delete:
 *     summary: Delete the current user's avatar
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 */
app.put('/user/self/avatar', requireAuth, uploadAvatar.single('avatar'), uploadUserAvatar);
app.delete('/user/self/avatar', requireAuth, deleteUserAvatar);

/**
 * @swagger
 * /user/{id}/avatar:
 *   get:
 *     summary: Get user avatar by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *          type: integer
 *     responses:
 *       200:
 *         description: Returns the image blob
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 */
app.get('/user/:id/avatar', getAvatarById);

/**
 * @swagger
 * /user/{id}/pseudo:
 *   get:
 *     summary: Get user pseudo by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *          type: integer
 *     responses:
 *       200:
 *         description: Returns the user's pseudo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pseudo: { type: string }
 */
app.get('/user/:id/pseudo', getPseudoById);

// ========================
// COMPETITION ROUTES (Protected by START_DATE)
// ========================
app.use('/problem', requireCompetitionStarted);
app.use('/scoreboard', requireCompetitionStarted);

/**
 * @swagger
 * /problem/all:
 *   get:
 *     summary: Get all problems
 *     tags: [Problem]
 *     responses:
 *       200:
 *         description: A list of problems (Empty if before START_DATE)
 */
app.get('/problem/all', getAllProblems);

/**
 * @swagger
 * /problem/languages:
 *   get:
 *     summary: Get all supported languages
 *     tags: [Problem]
 *     responses:
 *       200:
 *         description: A list of languages
 */
app.get('/problem/languages', getAllLanguages);

/**
 * @swagger
 * /problem/statuses:
 *   get:
 *     summary: Get all possible submission statuses
 *     tags: [Problem]
 *     responses:
 *       200:
 *         description: A list of statuses
 */
app.get('/problem/statuses', getAllStatuses);

/**
 * @swagger
 * /problem/{id}/samples:
 *   get:
 *     summary: Get all samples for a specific problem
 *     tags: [Problem]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of samples
 */
app.get('/problem/:id/samples', getAllSamplesByProblem);

/**
 * @swagger
 * /problem/{id}/skeleton/{language}:
 *   get:
 *     summary: Get the skeleton code for a specific problem and language
 *     tags: [Problem]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns the raw code file
 */
app.get('/problem/:id/skeleton/:language', getSkeletonCodeByProblem);

/**
 * @swagger
 * /problem/{id}/user-info:
 *   get:
 *     summary: Get submit status and tries for a problem for the current user
 *     tags: [Problem]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns status and number_tries
 */
app.get('/problem/:id/user-info', requireAuth, getUserInfoByProblem);

/**
 * @swagger
 * /problem/{id}/submits:
 *   get:
 *     summary: Get all submits for a specific problem for the current user
 *     tags: [Problem]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of submits
 */
app.get('/problem/:id/submits', requireAuth, getAllSubmitsByProblem);

/**
 * @swagger
 * /scoreboard:
 *   get:
 *     summary: Get the competition scoreboard
 *     description: Computes tries and solve times based on START_DATE and FREEZE_DATE.
 *     tags: [Scoreboard]
 *     responses:
 *       200:
 *         description: Returns the computed user scores
 */
app.get('/scoreboard', getScoreboard);

// ========================
// SUBMIT ROUTES
// ========================


// submit a solution by sending a file/blob with the code and the problem and language as parameters
/**
 * @swagger
 * /submit:
 *   post:
 *     summary: Submit a solution for a problem
 *     tags: [Submit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: problem
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Submission received and is being processed
 */
app.post('/submit/:problem/:language', requireAuth, uploadCode.single('file'), submitSolution);

/**
 * @swagger
 * /submit/{id}/code:
 *   get:
 *     summary: Get the submitted code for a specific submission
 *     tags: [Submit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns the submitted code as a raw file/blob
 */
app.get('/submit/:id/code', requireAuth, getCodeBySubmitId);

// Start server
app.listen(env.PORT, () => {
    console.log(`🚀 Competition Backend running on port ${env.PORT}`);
    console.log(`⏱️ Start Date: ${env.START_DATE}`);
    console.log(`🧊 Freeze Date: ${env.FREEZE_DATE}`);
});
