import dbConnect from '@/lib/dbConnection';
import { User } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/option';
import { getServerSession } from 'next-auth';
import ApiError from '@/helpers/ApiError';
import ApiResponse from '@/helpers/ApiResponse';
import mongoose from 'mongoose';
import TestModel, { questionSetsI } from '@/models/test.model';

export async function POST(request: Request) {
    dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return ApiError(402, false, 'User is not logged in!');
    }

    const sessionUser: User = session.user as User;
    const userId = new mongoose.Types.ObjectId(sessionUser._id); // converting the normal string to mongoDB ObjectId

    if (sessionUser.role !== 'student') {
        return ApiError(403, false, 'You are not authorized to fetch a set');
    }

    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    const setId = searchParams.get('setId');

    if (!testId || !mongoose.isValidObjectId(testId)) {
        return ApiError(400, false, 'Invalid or missing test ID');
    }
    if (!setId || !mongoose.isValidObjectId(setId)) {
        return ApiError(400, false, 'Invalid or missing set ID');
    }

    try {
        const { answers } = await request.json();
        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return ApiError(
                400,
                false,
                'Answers are required and must be an array'
            );
        }

        const test = await TestModel.findOne({
            _id: testId,
            'sets._id': setId,
        });

        if (!test) {
            return ApiError(404, false, 'Test or set not found');
        }

        

    } catch (error) {
        console.error('Error submitting test response:', error);
        return ApiError(500, false, 'Internal Server Error');
    }
}
