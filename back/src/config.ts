import dotenv from 'dotenv';
dotenv.config();

const requiredEnvs = [
    'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT',
    'JWT_SECRET', 'START_DATE', 'FREEZE_DATE', 'FRONT_URL', 
    'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'
];

for (const key of requiredEnvs) {
    if (!process.env[key]) {
        throw new Error(`Missing environment variable: ${key}`);
    }
}

export const env = {
    PORT: parseInt(process.env.PORT || '3000', 10),
    DB_HOST: process.env.DB_HOST!,
    DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
    DB_USER: process.env.DB_USER!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_NAME: process.env.DB_NAME!,
    JWT_SECRET: process.env.JWT_SECRET!,
    START_DATE: new Date(process.env.START_DATE!),
    FREEZE_DATE: new Date(process.env.FREEZE_DATE!),
    FRONT_URL: process.env.FRONT_URL!,
    SMTP_HOST: process.env.SMTP_HOST!,
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    SMTP_USER: process.env.SMTP_USER!,
    SMTP_PASS: process.env.SMTP_PASS!,
    EMAIL_FROM: process.env.EMAIL_FROM!,
};
