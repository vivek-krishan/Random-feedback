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

const signUp = () => {
    const [username, setUsername] = useState('');
    const [isUsernameAvailable, setIsUsernameAvailable] = useState({
        message: '',
        status: 0,
    });
    const [loading, setLoading] = useState({
        isCheckingUsername: false,
        isSubmitting: false,
    });

    const debounced = useDebounceCallback(setUsername, 500);
    const router = useRouter();

    // console.log('debounced Username', debouncedUsername);
    // Zod implementation
    const register = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
        },
    });

    // checking if the username is available or not
    useEffect(() => {
        if (!username || username.length < 3) return;

        const checkUsernameAvailability = async () => {
            setLoading((prev) => ({ ...prev, isCheckingUsername: true }));
            setIsUsernameAvailable({
                message: '',
                status: 0,
            });

            try {
                const response = await axios.get(
                    `/api/check-unique-username?username=${username}`
                );

                console.log('response in checking username:', response);
                setIsUsernameAvailable({
                    message: response.data.message,
                    status: response.data.status,
                });
            } catch (error) {
                console.error(
                    'error in checking username availability:',
                    error
                );

                const axiosError = error as AxiosError<ApiErrorInterface>;
                setIsUsernameAvailable({
                    message:
                        axiosError.response?.data.message ??
                        'error in checking username availability',
                    status: axiosError.response?.status || 500,
                });
            } finally {
                setLoading((prev) => ({ ...prev, isCheckingUsername: false }));
            }
        };

        checkUsernameAvailability();
    }, [username]);

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setLoading((prev) => ({ ...prev, isSubmitting: true }));
        try {
            const response = await axios.post<ApiResponseInterface>(
                'api/sign-up',
                data
            );

            toast.success(response.data.message || 'Success!');
            console.log('response in sign up:', response);

            router.replace(`/verify/${username}`);
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorInterface>;
            toast.error(axiosError.response?.data.message);
        } finally {
            setLoading((prev) => ({ ...prev, isSubmitting: false }));
        }
    };

    return (
        <div className="bg-blue-50 h-screen w-screen flex items-center justify-center">
            <div className="w-[40%] bg-white p-10 rounded-2xl drop-shadow-lg">
                <h1 className="text-center mb-10 text-xl font-bold font-serif">
                    Welcome to Random Feedback
                </h1>
                <Form {...register}>
                    <form
                        onSubmit={register.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <FormField
                            name="username"
                            control={register.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Username"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                debounced(e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    {loading.isCheckingUsername ? (
                                        <Loader className="animate-spin" />
                                    ) : null}
                                    {isUsernameAvailable.status != 0 ? (
                                        <span
                                            className={`text-sm ${isUsernameAvailable.status === 201 ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                            {isUsernameAvailable.message}
                                        </span>
                                    ) : null}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="email"
                            control={register.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your email"
                                            {...field}
                                            type="email"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="password"
                            control={register.control}
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

                        <Button type="submit" disabled={loading.isSubmitting}>
                            {loading.isSubmitting ? (
                                <Loader className="animate-spin" />
                            ) : (
                                'Submit'
                            )}
                        </Button>
                    </form>
                </Form>
                <div className="mt-5 text-center flex justify-center items-center">
                    <h4>Already member of our platform</h4>
                    <Link href="/sign-in">
                        <Button
                            variant="link"
                            className="text-blue-600 cursor-pointer"
                        >
                            Sign In
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default signUp;
