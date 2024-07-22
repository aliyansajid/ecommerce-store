import connect from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export const POST = async (request: Request) => {
    const { email, otp } = await request.json();
    await connect();

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        if (user.otp !== otp) {
            return new NextResponse("The OTP you have entered is incorrect. Please try again.", { status: 400 });
        }

        if (user.otpExpiry < Date.now()) {
            return new NextResponse("The OTP you have entered is expired. Please request a new one.", { status: 400 });
        }

        user.otp = undefined;
        user.otpExpiry = undefined;
        user.emailVerified = true;
        await user.save();

        return new NextResponse("Email verified successfully", { status: 200 });
    } catch (error: any) {
        return new NextResponse(error.message, { status: 500 });
    }
};