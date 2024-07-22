"use client";

import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { CustomFormField } from "@/components/CustomFormField";
import OTPForm from "@/components/forms/OTPForm";

const formSchema = z.object({
    firstName: z.string().min(3, { message: "First name must be at least 3 characters." }),
    lastName: z.string().min(1, { message: "Last name is required." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
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

export function RegisterForm() {
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error">("success");
    const [showOTP, setShowOTP] = useState(false);
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const { firstName, lastName, email, password } = values;
        setEmail(email);
        setFirstName(firstName);
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ firstName, lastName, email, password })
            });

            if (res.ok) {
                setShowOTP(true);
            } else {
                const errorText = await res.text();
                setMessageType("error");
                setMessage(errorText === "Email is already registered"
                    ? "This email is already in use. Please use a different email."
                    : "Registration failed. Please try again later.");
            }
        } catch (error) {
            setMessageType("error");
            setMessage("An unexpected error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className="flex flex-col md:flex-row min-h-screen">
            <div className="md:w-1/2 flex items-center justify-center bg-gray-100">
                <Image
                    src="/register.jpg"
                    alt="Register Illustration"
                    width={7934}
                    height={5292}
                    className="object-cover w-full h-full"
                />
            </div>
            <div className="md:w-1/2 flex items-center justify-center">
                <div className="w-full max-w-md mx-auto py-20 px-8">
                    <h1 className="text-3xl text-primary font-jakartaSans font-semibold">
                        Create Your Account
                    </h1>
                    <p className="text-base text-secondary font-jakartaSans mt-3 mb-5">
                        Join us today! Fill out the form below to get started.
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
                    {message && (
                        <div className={`text-${messageType === "success" ? "green" : "red"}-500 mb-4 font-jakartaSans`}>
                            {message}
                        </div>
                    )}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CustomFormField control={form.control} name="firstName" label="First Name" placeholder="John" />
                                <CustomFormField control={form.control} name="lastName" label="Last Name" placeholder="Doe" />
                            </div>
                            <CustomFormField control={form.control} name="email" label="Email" placeholder="Enter your email" />
                            <CustomFormField
                                control={form.control}
                                name="password"
                                label="Password"
                                placeholder="********"
                                type="password"
                            />
                            <CustomFormField
                                control={form.control}
                                name="confirmPassword"
                                label="Confirm Password"
                                placeholder="********"
                                type="password"
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Loading...' : 'Sign Up'}
                            </Button>
                        </form>
                    </Form>
                    <p className="text-sm text-primary font-jakartaSans text-center mt-5">
                        <span>Already have an account?</span>
                        <Link href="/" className="text-link font-jakartaSans font-semibold ml-1">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>

            {showOTP && <OTPForm email={email} />}
        </section>
    );
}

export default RegisterForm;