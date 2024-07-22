import connect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { generateAndSendOTP } from '../generate-otp/route';

export const POST = async (request: Request) => {
    const { firstName, lastName, email, password } = await request.json();
    await connect();

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return new NextResponse("Email is already registered", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 5);
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            emailVerified: false,
        });

        await newUser.save();
        await generateAndSendOTP(email, firstName);

        return new NextResponse("Registration successful. OTP has been sent to your email", { status: 200 });
    } catch (error: any) {
        return new NextResponse(error.message, { status: 500 });
    }
};