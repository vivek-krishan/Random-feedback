'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';
import axios, { AxiosError } from 'axios';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUpSchema } from '@/schemas/signUp.Schema';
import { ApiErrorInterface } from '@/types/ApiError';
import { ApiResponseInterface } from '@/types/ApiResponse';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader } from 'lucide-react';
import { signInSchema } from '@/schemas/signIn.Schema';
import { signIn } from 'next-auth/react';

const SignInPage = () => {
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    // console.log('debounced Username', debouncedUsername);
    // Zod implementation
    const signInForm = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: '',
            password: '',
        },
    });

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        setLoading(true);

        const response = await signIn('credentials', {
            identifier: data.identifier,
            password: data.password,
            redirect: false,
        });

        console.log(response);
        if (response?.error) {
            toast.error('Invalid credentials');
        } else if (response?.url) {
            toast.success('Login successful');
            router.replace('/dashboard');
        }

        setLoading(false);
    };

    return (
        <div className="bg-blue-50 h-screen w-screen flex items-center justify-center">
            <div className="w-[40%] bg-white p-10 rounded-2xl drop-shadow-lg">
                <div className="Heading mb-10">
                    <h1 className="text-center mb-10 text-xl font-bold font-serif">
                        Welcome Back to Random Feedback
                    </h1>
                    <span className="text-center text-sm text-gray-500">
                        Please Enter you email/username and password for sign in
                    </span>
                </div>
                <Form {...signInForm}>
                    <form
                        onSubmit={signInForm.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <FormField
                            name="identifier"
                            control={signInForm.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="password"
                            control={signInForm.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your password"
                                            {...field}
                                            type="password"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <Loader className="animate-spin" />
                            ) : (
                                'Submit'
                            )}
                        </Button>
                    </form>
                </Form>
                <div className="mt-5 text-center flex justify-center items-center">
                    <h4>Not a member of our platform</h4>
                    <Link href="/sign-up">
                        <Button
                            variant="link"
                            className="text-blue-600 cursor-pointer"
                        >
                            Sign Up
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
