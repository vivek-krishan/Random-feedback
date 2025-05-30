import dbConnect from '@/lib/dbConnection';
import { User } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/option';
import { getServerSession } from 'next-auth';
import ApiError from '@/helpers/ApiError';
import ApiResponse from '@/helpers/ApiResponse';
import mongoose from 'mongoose';
import TestModel, { questionSetsI } from '@/models/test.model';
import UserModel from '@/models/user.model';

export async function GET(request: Request) {
    dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return ApiError(402, false, 'User is not logged in!');
    }

    const sessionUser: User = session.user as User;
    const userId = new mongoose.Types.ObjectId(sessionUser._id); // converting the normal string to mongoDB ObjectId

    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    if (!testId || !mongoose.isValidObjectId(testId)) {
        return ApiError(400, false, 'Invalid or missing test ID');
    }

    try {
        const test = await TestModel.findById(testId);
        if (!test) return ApiError(400, false, 'Test not found!');
        const startTime = new Date(test.timing.start).getTime();
        const now = Date.now();
        if (startTime > now) {
            return ApiError(400, false, 'Test has not started yet!');
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return ApiError(
                404,
                false,
                'User not found! Authentication failed'
            );
        }

        const isAttempted = user.allTests?.includes(
            test._id as mongoose.Types.ObjectId
        );

        return ApiResponse<boolean>(
            201,
            true,
            'Attempt status checked',
            isAttempted
        );
    } catch (error) {
        console.error('Error checking attempts:', error);
    }
}
