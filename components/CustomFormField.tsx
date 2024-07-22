"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";

interface CustomFormFieldProps {
    control: any;
    name: string;
    label: string;
    placeholder: string;
    type?: string;
}

export const CustomFormField: React.FC<CustomFormFieldProps> = ({
    control,
    name,
    label,
    placeholder,
    type = "text",
}) => {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-sm text-primary font-jakartaSans font-medium">{label}</FormLabel>
                    <FormControl>
                        <Input
                            className="focus:border-none focus-visible:ring-2 focus-visible:ring-offset-0"
                            type={type}
                            placeholder={placeholder}
                            {...field}
                        />
                    </FormControl>
                    <FormMessage className="font-jakartaSans" />
                </FormItem>
            )}
        />
    );
};