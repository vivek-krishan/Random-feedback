import dbConnect from '@/lib/dbConnection';
import UserModel from '@/models/User.model';
import { User } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/option';
import { getServerSession } from 'next-auth';
import ApiError from '@/helpers/ApiError';
import ApiResponse from '@/helpers/ApiResponse';

export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return ApiError(402, false, 'User is not logged in!');
    }

    const sessionUser: User = session.user as User;

    try {
        const { status } = await request.json();

        const user = await UserModel.findByIdAndUpdate(
            sessionUser._id,
            {
                availableForMessages: status,
            },
            { new: true }
        ).select('-password -verificationToken -verificationTokenExpiry');

        if (!user) return ApiError(404, false, 'User not found!');

        return ApiResponse(
            200,
            true,
            "user's message acceptance status updated successfully",
            [],
            user
        );
    } catch (error) {
        console.error(
            "Error is updating the user's message acceptance status",
            error
        );
        return ApiError(
            500,
            false,
            "Error is updating the user's message acceptance status"
        );
    }
}

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return ApiError(402, false, 'User is not logged in!');
    }

    const sessionUser: User = session.user as User;

    try {
        const user = await UserModel.findById(sessionUser._id);
        if (!user) return ApiError(404, false, 'User not found!');

        return ApiResponse(200, true, 'Status found', [], user);
    } catch (error) {
        console.error("Error in finding user's message acceptance status!");
        return ApiError(
            500,
            false,
            "Error in finding user's message acceptance status!"
        );
    }
}
