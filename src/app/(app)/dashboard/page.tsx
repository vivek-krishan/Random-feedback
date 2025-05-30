'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { IMessage } from '@/models/user.model';
import { acceptMessageSchema } from '@/schemas/acceptMessage.Schema';
import { ApiErrorInterface } from '@/types/ApiError';
import { ApiResponseInterface } from '@/types/ApiResponse';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import MessageCard from '@/components/custom/message-card';

export default function Dashboard() {
    const [loading, setLoading] = useState({
        deleteMessage: false,
        acceptMessages: false,
        fetchMessages: false,
    });
    const [messages, setMessages] = useState<IMessage[]>([]); // Define the type of messages based on your data structure

    const { data: session } = useSession();

    const form = useForm({
        resolver: zodResolver(acceptMessageSchema),
    });

    const { register, setValue, watch } = form;

    const acceptMessages = watch('acceptMessages');

    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const profileUrl = `${baseUrl}/u/${session?.user.username}`;

    const handleDeleteMessage = (messageId: string) => {
        setMessages(messages.filter((message) => message._id !== messageId));
    };

    const fetchAvailabilityForMessages = useCallback(async () => {
        try {
            setLoading((prev) => ({ ...prev, acceptMessages: true }));
            const response = await axios.get<ApiResponseInterface>(
                '/api/accept-messages'
            );
            if (response.status === 201) {
                const { availableForMessages } = response.data.data as User;
                setValue('acceptMessages', Boolean(availableForMessages));
            }
        } catch (error) {
            console.error('Error fetching availability for messages:', error);
            const axiosError = error as AxiosError<ApiErrorInterface>;
            toast.error(
                axiosError.response?.data.message || 'Error fetching data'
            );
        } finally {
            setLoading((prev) => ({ ...prev, acceptMessages: false }));
        }
    }, [setValue]);

    const fetchAllMessages = useCallback(
        async (refresh: boolean = false) => {
            try {
                setLoading((prev) => ({
                    ...prev,
                    fetchMessages: true,
                    acceptMessages: false,
                }));
                const response = await axios.get<ApiResponseInterface>(
                    '/api/get-messages'
                );

                if (response.status === 201) {
                    setMessages(
                        (response.data.messageData as IMessage[]) || []
                    );
                }
            } catch (error) {
                console.error(
                    'Error fetching availability for messages:',
                    error
                );
                const axiosError = error as AxiosError<ApiErrorInterface>;
                toast.error(
                    axiosError.response?.data.message || 'Error fetching data'
                );
            } finally {
                setLoading((prev) => ({ ...prev, fetchMessages: false }));
            }
        },
        [loading.fetchMessages, setMessages]
    );

    useEffect(() => {
        if (!session || !session.user) return;

        fetchAllMessages();
        fetchAvailabilityForMessages();
    }, [session]);

    const handleChangeAvailabilityForMessages = async () => {
        try {
            setLoading((prev) => ({ ...prev, acceptMessages: true }));
            const response = await axios.post<ApiResponseInterface>(
                '/api/accept-messages',
                {
                    status: !acceptMessages,
                }
            );
            console.log(response.data);
            if (response.status === 200) {
                toast.success(
                    'User message acceptance status updated successfully'
                );
            }
        } catch (error) {
            console.error('Error fetching availability for messages:', error);
            const axiosError = error as AxiosError<ApiErrorInterface>;
            toast.error(
                axiosError.response?.data.message || 'Error fetching data'
            );
        } finally {
            setLoading((prev) => ({ ...prev, acceptMessages: false }));
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl);
        toast.info('Profile URL copied to clipboard');
    };

    // Early return if session is not available or user is not logged in
    // This is important to prevent rendering the dashboard when the user is not logged in
    if (!session || !session.user)
        return (
            <div>
                <h1 className="text-2xl font-bold">
                    Please login to view your dashboard
                </h1>
            </div>
        );

    return (
        <div className="Dashboard flex flex-col w-4/5 m-auto ">
            <div className="Heading">
                <h1 className="text-xl font-bold">User Dashboard</h1>
                <span className="text-sm text-gray-500">
                    Copy your unique profile url
                </span>
            </div>
            <div className="Profile-Url my-5 pr-20 flex items-center justify-between">
                <input
                    type="text"
                    value={profileUrl}
                    disabled
                    className="text-sm w-60 text-gray-700 font-semibold "
                />
                <Button onClick={copyToClipboard} variant={'default'}>
                    Copy
                </Button>
            </div>
            <Separator className="my-5" />
            <div className="flex flex-col items-start justify-start mb-5">
                <Switch
                    {...register('acceptMessages')}
                    checked={acceptMessages}
                    onCheckedChange={handleChangeAvailabilityForMessages}
                    disabled={loading.acceptMessages}
                />
                <span className="text-sm">
                    Accept Messages: {acceptMessages ? 'On' : 'Off'}
                </span>
            </div>
            <div className="All-messages">
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <MessageCard
                            message={msg}
                            onDeleteMessage={handleDeleteMessage}
                            key={index}
                        />
                    ))
                ) : (
                    <div>
                        <h1>You don't have any messages</h1>
                    </div>
                )}
            </div>
        </div>
    );
}
