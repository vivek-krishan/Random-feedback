import dbConnect from '@/lib/dbConnection';
import { User } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import { getServerSession } from 'next-auth';
import ApiError from '@/helpers/ApiError';
import ApiResponse from '@/helpers/ApiResponse';
import mongoose from 'mongoose';
import TestModel, { questionSetsI, TestI } from '@/models/test.model';
import UserModel from '@/models/user.model';

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return ApiError(402, false, 'User is not logged in!');
    }

    const sessionUser: User = session.user as User;
    const userId = new mongoose.Types.ObjectId(sessionUser.id);

    try {
        const user = await UserModel.findById(userId).populate('allTests');
        if (!user) {
            return ApiError(
                404,
                false,
                'User not found! Authentication failed'
            );
        }

        const allTests = user.allTests as TestI[];

        return ApiResponse<TestI>(
            201,
            true,
            'All tests fetched successfully',
            undefined,
            allTests
        );
    } catch (error) {
        console.log('error in fetching the data, ', error);
        return ApiError(500, false, 'Internal server error');
    }
}
