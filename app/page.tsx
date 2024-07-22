"use client";

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CustomFormField } from "@/components/CustomFormField";
import OTPForm from "@/components/forms/OTPForm";

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string(),
});

export function LoginForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [showOTP, setShowOTP] = useState(false);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (sessionStatus === "authenticated") {
            router.replace("/dashboard");
        }
    }, [sessionStatus, router]);

    const handleRememberMeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRememberMe(event.target.checked);
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        const res = await signIn("credentials", {
            redirect: false,
            email: values.email,
            password: values.password,
            rememberMe,
        });

        if (res?.error) {
            if (res.error === "Email not verified. A new OTP has been sent to your email.") {
                setEmail(values.email);
                setShowOTP(true);
            } else {
                setError("Invalid email or password");
            }
        } else {
            setError("");
            router.replace("/dashboard");
        }
        setIsLoading(false);
    }

    return (
        <section className="flex flex-col md:flex-row min-h-screen">
            <div className="md:w-1/2 flex items-center justify-center bg-gray-100">
                <Image
                    src="/login.jpg"
                    alt="Login Illustration"
                    width={6451}
                    height={4301}
                    className="object-cover w-full h-full"
                />
            </div>
            <div className="md:w-1/2 flex items-center justify-center">
                <div className="w-full max-w-md mx-auto py-20 px-8">
                    <h1 className="text-3xl text-primary font-jakartaSans font-semibold">
                        Welcome Back!
                    </h1>
                    <p className="text-base text-secondary font-jakartaSans mt-3 mb-5">
                        Login to your account to continue.
                    </p>
                    <Button
                        className="group flex items-center justify-center w-full bg-white space-x-3 border border-accent"
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                    >
                        <Image
                            src="/google.svg"
                            alt="Google Logo"
                            width={24}
                            height={24}
                        />
                        <span className="text-sm text-primary font-jakartaSans font-medium group-hover:text-white">
                            Continue with Google
                        </span>
                    </Button>
                    <div className="flex items-center my-4">
                        <div className="flex-grow h-px bg-accent"></div>
                        <span className="flex-shrink mx-4 text-xs text-secondary font-jakartaSans">
                            or
                        </span>
                        <div className="flex-grow h-px bg-accent"></div>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <CustomFormField control={form.control} name="email" label="Email" placeholder="Enter your email" />
                            <CustomFormField control={form.control} name="password" label="Password" placeholder="********" type="password" />
                            {error && <p className="text-red-500">{error}</p>}
                            <div className="flex items-center justify-between">
                                <div>
                                    <input type="checkbox" id="rememberMe" className="mr-2" onChange={handleRememberMeChange} />
                                    <label htmlFor="rememberMe" className="text-sm text-secondary font-jakartaSans font-medium">
                                        Remember me
                                    </label>
                                </div>
                                <Link href="/forget-password">
                                    <span className="text-sm text-primary font-jakartaSans font-medium">
                                        Forgot Password
                                    </span>
                                </Link>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Loading...' : 'Login'}
                            </Button>
                        </form>
                    </Form>
                    <p className="text-sm text-primary font-jakartaSans text-center mt-5">
                        <span>Don&apos;t have an account?</span>
                        <Link href="/register">
                            <span className="text-link font-jakartaSans font-semibold ml-1">
                                Sign Up
                            </span>
                        </Link>
                    </p>
                </div>
            </div>

            {showOTP && <OTPForm email={email} />}
        </section>
    );
}

export default LoginForm;