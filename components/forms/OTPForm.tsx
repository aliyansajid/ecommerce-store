import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";

interface OTPFormProps {
    email: string;
}

const OTPForm: React.FC<OTPFormProps> = ({ email }) => {
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error">("error");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const handleOTPChange = (value: string) => {
        setOtp(value);
    };

    const handleVerifyOTP = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, otp })
            });

            if (!res.ok) {
                const errorText = await res.text();
                setMessage(errorText);
                setMessageType("error");
                setIsLoading(false);
                return;
            }

            setMessage("Email verified successfully! Redirecting to login...");
            setMessageType("success");
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);
        } catch (error) {
            setMessage("Invalid or expired OTP. Please try again.");
            setMessageType("error");
            setIsLoading(false);
        }
    }, [email, otp]);

    const handleResendOTP = async () => {
        setIsResending(true);
        try {
            const res = await fetch('/api/auth/generate-otp', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, firstName: '' })
            });

            if (!res.ok) {
                const errorText = await res.text();
                setMessage(errorText);
                setMessageType("error");
                setIsResending(false);
                return;
            }

            setMessage("A new OTP has been sent to your email address.");
            setMessageType("success");
            setIsResending(false);
        } catch (error) {
            setMessage("Failed to resend OTP. Please try again.");
            setMessageType("error");
            setIsResending(false);
        }
    };

    useEffect(() => {
        if (otp.length === 6) {
            handleVerifyOTP();
        }
    }, [otp, handleVerifyOTP]);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-5">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md font-jakartaSans">
                <h2 className="text-xl font-semibold mb-4">Email Verification</h2>
                <p className="mb-4">To verify your email, please enter the OTP sent to your email address.</p>
                {message && (
                    <div className={`text-${messageType === "success" ? "green" : "red"}-500 mb-4`}>
                        {message}
                    </div>
                )}
                <InputOTP maxLength={6} value={otp} onChange={handleOTPChange} className="w-full">
                    <InputOTPGroup className="flex w-full justify-between space-x-2">
                        <InputOTPSlot className="flex-grow px-3 py-6 border border-gray-300 rounded text-center text-xl" index={0} />
                        <InputOTPSlot className="flex-grow px-3 py-6 border border-gray-300 rounded text-center text-xl" index={1} />
                        <InputOTPSlot className="flex-grow px-3 py-6 border border-gray-300 rounded text-center text-xl" index={2} />
                        <InputOTPSeparator />
                        <InputOTPSlot className="flex-grow px-3 py-6 border border-gray-300 rounded text-center text-xl" index={3} />
                        <InputOTPSlot className="flex-grow px-3 py-6 border border-gray-300 rounded text-center text-xl" index={4} />
                        <InputOTPSlot className="flex-grow px-3 py-6 border border-gray-300 rounded text-center text-xl" index={5} />
                    </InputOTPGroup>
                </InputOTP>
                <Button className="mt-4 w-full" onClick={handleVerifyOTP} disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
                <Button className="mt-2 w-full bg-white text-[#0F172A] border-2 border-[#0F172A] hover:bg-[#0F172A] hover:text-white" onClick={handleResendOTP} disabled={isResending}>
                    {isResending ? "Resending..." : "Resend OTP"}
                </Button>
            </div>
        </div>
    );
};

export default OTPForm;