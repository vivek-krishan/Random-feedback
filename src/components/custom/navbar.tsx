'use client'
import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User } from 'next-auth';
import Link from 'next/link';
import { Button } from '../ui/button';

const Navbar = () => {
    const sessionData = useSession();
    console.log(sessionData);
    const { data: session, status } = useSession();
    const user: User = session?.user as User;
    return (
        <div>
            <nav>
                {session ? (
                    <div>
                        <div className="flex justify-between items-center  p-4">
                            <div className="w-full flex justify-around items-center space-x-4">
                                <span className="text-black">
                                    Welcome {user?.username}
                                </span>
                                <button
                                    onClick={() => signOut()}
                                    className="bg-red-500 text-black px-4 py-2 rounded"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center p-4 ">
                            <div className="w-full flex justify-around items-center space-x-4  ">
                                <span className="text-black">
                                    Welcome Guest
                                </span>
                                <Link href="sign-in">
                                    <Button variant={'default'}>
                                        Sign In
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Navbar;
