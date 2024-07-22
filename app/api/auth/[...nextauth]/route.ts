import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import connect from "@/lib/db";
import { generateAndSendOTP } from '../generate-otp/route';

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials) {
                    throw new Error("No credentials provided");
                }

                await connect();

                const user = await User.findOne({ email: credentials.email });

                if (!user) {
                    throw new Error("No user found");
                }

                const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordCorrect) {
                    throw new Error("Invalid credentials");
                }

                if (!user.emailVerified) {
                    await generateAndSendOTP(user.email, user.firstName);
                    throw new Error("Email not verified. A new OTP has been sent to your email.");
                }

                return {
                    id: user._id,
                    email: user.email,
                    name: `${user.firstName}`,
                };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile, credentials }: { user: any; account: any; profile?: any; credentials?: any }) {
            if (account?.provider === "google") {
                await connect();
                const existingUser = await User.findOne({ email: user.email });
                if (!existingUser) {
                    const newUser = new User({
                        email: user.email,
                        firstName: (profile as any)?.given_name || "",
                        lastName: (profile as any)?.family_name || "",
                        emailVerified: true
                    });
                    await newUser.save();
                }
            }
            return true;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.name = token.name;
            }
            return session;
        },
        async jwt({ token, user, account, profile, isNewUser }: { token: any; user?: any; account?: any; profile?: any; isNewUser?: boolean }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
            }
            return token;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        maxAge: 30 * 24 * 60 * 60,
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };