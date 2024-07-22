import { NextResponse } from 'next/server';
import connect from '@/lib/db';
import User from '@/models/User';
import nodemailer from 'nodemailer';

export const POST = async (request: Request) => {
    const { email, firstName } = await request.json();
    await connect();

    try {
        await generateAndSendOTP(email, firstName);
        return new NextResponse("OTP has been sent to your email", { status: 200 });
    } catch (error: any) {
        return new NextResponse(error.message, { status: 500 });
    }
};

export const generateAndSendOTP = async (email: string, firstName: string): Promise<void> => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

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
        subject: 'Verify Your Account',
        text: `Dear ${firstName},

To complete the email verification process, please use the following One-Time Password (OTP):
Your OTP code: ${otp}
This code will expire at ${new Date(otpExpiry).toLocaleTimeString()}.

If you did not initiate this request, please disregard this email.

Best regards,
Aliyan Sajid`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error("Failed to send email");
    }
};