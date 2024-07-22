import User from '@/models/User';
import connect from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export const POST = async (request: any) => {
    const { email } = await request.json();
    await connect();

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        return new NextResponse("Email is not registered", { status: 400 });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const passwordResetExpires = Date.now() + 3600000;

    existingUser.resetToken = passwordResetToken;
    existingUser.passwordResetExpiry = passwordResetExpires;
    await existingUser.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"Aliyan Sajid" <${process.env.EMAIL_USERNAME}>`,
        to: email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Please click the following link to reset your password: ${resetUrl}`,
        html: `<p>You requested a password reset. Please click the following link to reset your password:</p><a href="${resetUrl}">Reset Password</a>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return new NextResponse("Password reset link has been sent to your email", { status: 200 });
    } catch (error) {
        return new NextResponse("Failed to send email", { status: 500 });
    }
};