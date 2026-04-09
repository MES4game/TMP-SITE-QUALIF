import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from './auth.middleware';
import { env } from '../config';

export const AVATAR_DIR = path.join(env.MOUNTED_FOLDER, 'uploads', 'avatars');
export const CODE_DIR = path.join(env.MOUNTED_FOLDER, 'uploads', 'submits');

// Ensure uploads directory exists
if (!fs.existsSync(AVATAR_DIR)) {
    fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

if (!fs.existsSync(CODE_DIR)) {
    fs.mkdirSync(CODE_DIR, { recursive: true });
}

const storageAvatar = multer.diskStorage({
    destination: (req, file, cb) => cb(null, AVATAR_DIR),
    filename: (req: AuthRequest, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.user_id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const storageCode = multer.diskStorage({
    destination: (req, file, cb) => cb(null, CODE_DIR),
    filename: (req: AuthRequest, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.user_id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const uploadAvatar = multer({ 
    storage: storageAvatar,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export const uploadCode = multer({ 
    storage: storageCode,
    limits: { fileSize: 1024 * 1024 } 
});
