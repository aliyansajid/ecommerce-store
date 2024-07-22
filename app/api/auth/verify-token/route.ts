import User from '@/models/User';
import connect from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const POST = async (request: any) => {
    const { token } = await request.json();
    await connect();

    const hashToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetToken: hashToken,
        passwordResetExpiry: { $gt: Date.now() }
    });

    if (!user) {
        return new NextResponse(JSON.stringify({ message: "Reset link is expired" }), { status: 400 });
    }

    return new NextResponse(JSON.stringify(user), { status: 200 });
};