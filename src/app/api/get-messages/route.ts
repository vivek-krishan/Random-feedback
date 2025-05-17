import dbConnect from '@/lib/dbConnection';
import UserModel from '@/models/User.model';
import { User } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/option';
import { getServerSession } from 'next-auth';
import ApiError from '@/helpers/ApiError';
import ApiResponse from '@/helpers/ApiResponse';
import mongoose from 'mongoose';

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return ApiError(402, false, 'User is not logged in!');
    }

    const sessionUser: User = session.user as User;
    const userId = new mongoose.Types.ObjectId(sessionUser._id);

    try {
        const user = await UserModel.aggregate([
            {
                $match: {
                    _id: userId,
                },
            },
            {
                $unwind: '$messages',
            },
            {
                $sort: {
                    'messages.createdAt': -1,
                },
            },
            {
                $group: {
                    _id: '$_id',
                    messages: {
                        $push: '$messages',
                    },
                },
            },
        ]);

        if (!user) return ApiError(404, false, 'user not found!');

        return ApiResponse(
            201,
            true,
            'Fetched all the messages',
            user[0].messages
        );
    } catch (error) {
        console.error('Error in finding messages: ', error);
        return ApiError(500, false, 'Error in finding messages');
    }
}
