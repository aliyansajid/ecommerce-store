"use client";

import React, { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { CustomFormField } from '@/components/CustomFormField';

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." })
});

export function ForgetPasswordForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "" },
    });

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"error" | "success" | "">("");
    const router = useRouter();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const res = await fetch("/api/auth/forget-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: values.email }),
        });

        const userMessage = `If the email ${values.email} matches our records, a password reset link will be sent.`;

        if (!res.ok) {
            setMessage(userMessage);
            setMessageType("error");
        } else {
            setMessage(userMessage);
            setMessageType("success");
        }
    }

    return (
        <section className="flex flex-col md:flex-row min-h-screen">
            <div className="md:w-1/2 flex items-center justify-center bg-gray-100">
                <Image
                    src="/login.jpg"
                    alt="Forgot Password Illustration"
                    width={6451}
                    height={4301}
                    className="object-cover w-full h-full"
                />
            </div>
            <div className="md:w-1/2 flex items-center justify-center">
                <div className="w-full max-w-md mx-auto py-20 px-8">
                    <h1 className="text-3xl text-primary font-jakartaSans font-semibold">
                        Forgot Password
                    </h1>
                    <p className="text-base text-secondary font-jakartaSans mt-3 mb-5">
                        Enter your email to receive a password reset link.
                    </p>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <CustomFormField control={form.control} name="email" label="" placeholder="Enter your email" />
                            {message && <p className={`text-${messageType === "success" ? "red" : "red"}-500`}>{message}</p>}
                            <Button type="submit" className="w-full">Send Reset Link</Button>
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

export default ForgetPasswordForm;