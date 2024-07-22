"use client";

import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CustomFormField } from '@/components/CustomFormField';

const formSchema = z.object({
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters." })
        .refine(password => /[A-Z]/.test(password), {
            message: "Password must contain at least 1 uppercase letter.",
        })
        .refine(password => /[a-z]/.test(password), {
            message: "Password must contain at least 1 lowercase letter.",
        })
        .refine(password => /[0-9]/.test(password), {
            message: "Password must contain at least 1 number.",
        })
        .refine(password => /[!@#$%^&*(),.?":{}|<>]/.test(password), {
            message: "Password must contain at least 1 special character.",
        }),
    confirmPassword: z.string().min(8, { message: "Confirm password must be at least 8 characters." }),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

export function ResetPassword({ params }: any) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [verified, setVerified] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const router = useRouter();

    useEffect(() => {
        const verifyToken = async () => {
            const res = await fetch("/api/auth/verify-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: params.token }),
            });

            if (!res.ok) {
                setError("Reset link is expired");
                setSuccess("");
                setVerified(false);
            } else {
                setError("");
                setSuccess("");
                setVerified(true);
                const userData = await res.json();
                setUserEmail(userData.email);
            }
        };
        verifyToken();
    }, [params.token]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!verified) return;

        const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: params.token, email: userEmail, password: values.password }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            setError(errorData.message || "Failed to reset password");
            setSuccess("");
        } else {
            setError("");
            setSuccess("Password has been updated successfully");
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);
        }
    }

    return (
        <section className="flex flex-col md:flex-row min-h-screen">
            <div className="md:w-1/2 flex items-center justify-center bg-gray-100">
                <Image
                    src="/login.jpg"
                    alt="Reset Password Illustration"
                    width={6451}
                    height={4301}
                    className="object-cover w-full h-full"
                />
            </div>
            <div className="md:w-1/2 flex items-center justify-center">
                <div className="w-full max-w-md mx-auto py-20 px-8">
                    <h1 className="text-3xl text-primary font-jakartaSans font-semibold">
                        Reset Password
                    </h1>
                    <p className="text-base text-secondary font-jakartaSans mt-3 mb-5">
                        Please set your new password below.
                    </p>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <CustomFormField
                                control={form.control}
                                name="password"
                                label=""
                                placeholder="Enter new password"
                                type="password"
                            />
                            <CustomFormField
                                control={form.control}
                                name="confirmPassword"
                                label=""
                                placeholder="Confirm new password"
                                type="password"
                            />
                            {error && <p className="text-red-500 font-jakartaSans">{error}</p>}
                            {success && <p className="text-green-500 font-jakartaSans">{success}</p>}
                            <Button type="submit" className="w-full" disabled={!verified}>
                                Update Password
                            </Button>
                        </form>
                    </Form>
                    <div className="text-center mt-5">
                        <Link href="/">
                            <span className="text-link text-center text-sm font-jakartaSans font-semibold">
                                Back to Sign In
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ResetPassword;