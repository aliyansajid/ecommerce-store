import User from '@/models/User';
import connect from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export const POST = async (request: any) => {
    const { password, email } = await request.json();
    await connect();

    const existingUser = await User.findOne({ email });
    
    if (!existingUser) {
        return new NextResponse("User not found", { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    existingUser.password = hashedPassword;
    existingUser.resetToken = undefined;
    existingUser.passwordResetExpiry = undefined;

    try {
        await existingUser.save();
        return new NextResponse("Password updated successfully", { status: 200 });
    } catch (error: any) {
        return new NextResponse(`Error updating password: ${error.message}`, { status: 500 });
    }
};