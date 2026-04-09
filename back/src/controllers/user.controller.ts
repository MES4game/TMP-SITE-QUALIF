import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { env } from '../config';
import { AuthRequest } from '../middlewares/auth.middleware';
import path from 'path';
import fs from 'fs';
import { sendPasswordResetEmail, sendVerificationEmail } from '../utils/email.util';
import { ResultSetHeader } from 'mysql2';

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { pseudo, email, firstname, lastname, password } = req.body;
        
        const hash = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO users (pseudo, email, firstname, lastname, password_hash) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.query<ResultSetHeader>(query, [pseudo, email, firstname, lastname, hash]);

        const verificationToken = jwt.sign({ id: result.insertId }, env.JWT_SECRET, { expiresIn: '24h' });
        
        sendVerificationEmail(email, verificationToken).catch(console.error);

        return res.status(201).json({ message: "User registered successfully" });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Email or pseudo already exists" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        const decoded: any = jwt.verify(token, env.JWT_SECRET);
        const userId = decoded.id;

        await pool.query(`UPDATE users SET verified_email = TRUE WHERE id = ?`, [userId]);
        return res.json({ message: "Email verified successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { user_login, password } = req.body;
        
        const [users] = await pool.query<any[]>(`SELECT * FROM users WHERE email = ? OR pseudo = ?`, [user_login, user_login]);
        
        if (users.length === 0 || users[0].deleted_on !== null) {
            return res.status(401).json({ message: "Invalid credentials or account deleted" });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password_hash);
        
        if (!match) return res.status(401).json({ message: "Invalid credentials" });

        if (!user.verified_email) {
            return res.status(403).json({ message: "Email not verified" });
        }

        const token = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: '24h' });
        
        // Update last connection
        await pool.query(`UPDATE users SET last_connection = CURRENT_TIMESTAMP WHERE id = ?`, [user.id]);

        return res.json({ token });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getSelf = async (req: AuthRequest, res: Response) => {
    try {
        const [users] = await pool.query<any[]>(`SELECT id, email, pseudo, firstname, lastname, created_on, last_connection, deleted_on, verified_email FROM users WHERE id = ?`, [req.user_id]);
        
        if (users.length === 0) return res.status(404).json({ message: "User not found" });

        return res.json({ user: users[0] });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateSelf = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user_id;
        const { firstname, lastname, pseudo } = req.body;

        if (firstname !== undefined && typeof firstname === 'string') await pool.query(`UPDATE users SET firstname = ? WHERE id = ?`, [firstname, userId]);
        if (lastname !== undefined && typeof lastname === 'string') await pool.query(`UPDATE users SET lastname = ? WHERE id = ?`, [lastname, userId]);
        if (pseudo !== undefined && typeof pseudo === 'string') await pool.query(`UPDATE users SET pseudo = ? WHERE id = ?`, [pseudo, userId]);

        return res.json({ message: "User updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const forgotPassword = async (req: AuthRequest, res: Response) => {
    try {
        const { email } = req.body;
        const [users] = await pool.query<any[]>(`SELECT id FROM users WHERE email = ?`, [email]);
        
        if (users.length > 0) {
            const resetToken = jwt.sign({ id: users[0].id }, env.JWT_SECRET, { expiresIn: '1h' });
            sendPasswordResetEmail(email, resetToken).catch(console.error);
        }

        return res.json({ message: "If an account with that email exists, a password reset link has been sent" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
    try {
        const { token, new_password } = req.body;
        
        if (!token || !new_password) {
            return res.status(400).json({ message: "Token and new_password are required" });
        }

        // Verify the token
        const decoded: any = jwt.verify(token, env.JWT_SECRET);
        const userId = decoded.id;

        // Hash the new password and update the database
        const hash = await bcrypt.hash(new_password, 10);
        await pool.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, userId]);

        return res.json({ message: "Password has been successfully reset" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const uploadUserAvatar = async (req: AuthRequest, res: Response) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    try {
        const avatarPath = `/uploads/avatars/${req.file.filename}`;
        await pool.query(`UPDATE users SET avatar_path = ? WHERE id = ?`, [avatarPath, req.user_id]);
        return res.json({ message: "Avatar uploaded" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteUserAvatar = async (req: AuthRequest, res: Response) => {
    try {
        const [users] = await pool.query<any[]>(`SELECT avatar_path FROM users WHERE id = ?`, [req.user_id]);
        if (users.length === 0 || !users[0].avatar_path) {
            return res.status(404).json({ message: "Avatar not found" });
        }

        const avatarPath = path.join(__dirname, '../../', users[0].avatar_path);
        if (fs.existsSync(avatarPath)) {
            fs.unlinkSync(avatarPath);
        }

        await pool.query(`UPDATE users SET avatar_path = NULL WHERE id = ?`, [req.user_id]);
        return res.json({ message: "Avatar deleted" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAvatarById = async (req: Request, res: Response) => {
    try {
        const [users] = await pool.query<any[]>(`SELECT avatar_path FROM users WHERE id = ?`, [req.params.id]);
        if (users.length === 0 || !users[0].avatar_path) {
            return res.status(404).send("Avatar not found");
        }
        res.sendFile(path.join(__dirname, '../../', users[0].avatar_path));
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getPseudoById = async (req: Request, res: Response) => {
    try {
        const [users] = await pool.query<any[]>(`SELECT pseudo FROM users WHERE id = ?`, [req.params.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json({ pseudo: users[0].pseudo });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
    try {
        // Soft delete implementation as required by the frontend's `deleted_on` field
        await pool.query(`UPDATE users SET deleted_on = CURRENT_TIMESTAMP WHERE id = ?`, [req.user_id]);
        return res.json({ message: "Account deleted" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
