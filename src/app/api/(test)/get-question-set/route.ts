import dbConnect from '@/lib/dbConnection';
import { User } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/option';
import { getServerSession } from 'next-auth';
import ApiError from '@/helpers/ApiError';
import ApiResponse from '@/helpers/ApiResponse';
import mongoose from 'mongoose';
import TestModel, { questionSetsI } from '@/models/test.model';

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return ApiError(402, false, 'User is not logged in!');
    }

    const sessionUser: User = session.user as User;
    const userId = new mongoose.Types.ObjectId(sessionUser._id); // converting the normal string to mongoDB ObjectId

    if (sessionUser.role !== 'teacher') {
        return ApiError(403, false, 'You are not authorized to fetch a set');
    }

    try {
        const { searchParams } = new URL(request.url);
        const testId = searchParams.get('testId');
        const setId = searchParams.get('setId');
        if (!testId || !mongoose.isValidObjectId(testId)) {
            return ApiError(400, false, 'Invalid or missing test ID');
        }
        if (!setId || !mongoose.isValidObjectId(setId)) {
            return ApiError(400, false, 'Invalid or missing set ID');
        }

        const test = await TestModel.findById(testId);
        if (!test) return ApiError(400, false, 'Test not found!');

        const requiredSet = test.sets.find((set) => set._id == setId);
        if (!requiredSet) return ApiError(404, false, 'Set not found!');

        return ApiResponse<questionSetsI>(
            200,
            true,
            'Question paper fetched successfully!',
            requiredSet
        );
    } catch (error) {
        console.error('Error fetching question sets:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
