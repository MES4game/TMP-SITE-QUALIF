import nodemailer from 'nodemailer';
import { env } from '../config';

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

export const sendVerificationEmail = async (email: string, token: string) => {
    // Assuming your frontend has a route like /verify-email to catch this
    const verifyUrl = `${env.FRONT_URL}/verify-email/${token}`;

    await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: 'Verify your email address',
        html: `
            <h2>Welcome to the Competition!</h2>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verifyUrl}">${verifyUrl}</a>
            <p><i>This link will expire in 24 hours.</i></p>
        `,
    });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
    // Assuming your frontend has a route like /reset-password to catch this
    const resetUrl = `${env.FRONT_URL}/reset-password/${token}`;
    
    await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <h2>Password Reset</h2>
            <p>You requested a password reset. Click the link below to set a new password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p><i>If you did not request this, please ignore this email. The link will expire in 1 hour.</i></p>
        `,
    });
};
