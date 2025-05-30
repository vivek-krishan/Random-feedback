import dbConnect from '@/lib/dbConnection';
import UserModel from '@/models/user.model';
import { User } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/option';
import { getServerSession } from 'next-auth';
import ApiError from '@/helpers/ApiError';
import ApiResponse from '@/helpers/ApiResponse';
import mongoose from 'mongoose';
import TestModel, { questionSetsI, TestI } from '@/models/test.model';
import { getRandomNumber } from '@/helpers/utils';
import { questionSchema } from '@/schemas/test/createSet.schema';
import { z, ZodFormattedError } from 'zod';

// Get question sets
export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return ApiError(402, false, 'User is not logged in!');
    }

    const sessionUser: User = session.user as User;
    const userId = new mongoose.Types.ObjectId(sessionUser._id); // converting the normal string to mongoDB ObjectId

    if (sessionUser.role !== 'student') {
        return ApiError(403, false, 'You are not authorized to fetch a set');
    }

    try {
        const { searchParams } = new URL(request.url);
        const testId = searchParams.get('testId');
        if (!testId || !mongoose.isValidObjectId(testId)) {
            return ApiError(400, false, 'Invalid or missing test ID');
        }

        const test = await TestModel.findById(testId);
        if (!test) return ApiError(400, false, 'Test not found!');

        const randomSet = getRandomNumber(test.sets.length);

        const testSet = test.sets[randomSet];

        console.log(testSet);
        if (!testSet)
            return ApiError(
                500,
                false,
                'Some internal error in finding random sets!'
            );

        return ApiResponse<questionSetsI>(
            200,
            true,
            'Question paper fetched successfully!',
            testSet
        );
    } catch (error) {
        console.error('Error fetching question sets:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
// Add set
export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return ApiError(402, false, 'User is not logged in!');
    }

    const sessionUser: User = session.user as User;
    const userId = new mongoose.Types.ObjectId(sessionUser._id); // converting the normal string to mongoDB ObjectId

    if (sessionUser.role !== 'teacher') {
        return ApiError(403, false, 'You are not authorized to create a set');
    }

    try {
        const { questions } = await request.json();
        if (!questions) {
            return ApiError(400, false, 'Invalid or missing question set');
        }

        const validationResult = questionSchema.safeParse({ questions });

        if (!validationResult.success) {
            const formatted: ZodFormattedError<
                z.infer<typeof questionSchema>,
                string
            > = validationResult.error.format();

            const errors: Record<string, string> = {};

            // Collect all error messages of different attribute (name, email, password, role) from the formatted result
            for (const key in formatted) {
                const field = formatted[key as keyof typeof formatted];
                if (field && '_errors' in field && field._errors.length > 0) {
                    errors[key] = field._errors.join(', '); // or join(", ") if you want all messages
                }
            }

            const combinedErrorMessage = Object.values(errors).join(' | ');

            return ApiError(401, false, combinedErrorMessage);
        }

        const { searchParams } = new URL(request.url);
        const testId = searchParams.get('testId');
        if (!testId || !mongoose.isValidObjectId(testId)) {
            return ApiError(400, false, 'Invalid or missing test ID');
        }

        const test = await TestModel.findById(testId);
        if (!test) return ApiError(400, false, 'Test not found!');

        // Add the new question set to the test
        test.sets.push(questions);

        // Save the updated test
        await test.save();

        return ApiResponse<questionSetsI>(
            200,
            true,
            'Question set added successfully!',
            test.sets[test.sets.length - 1]
        );
    } catch (error) {
        console.error('Error adding question set:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
// Update set
export async function PATCH(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return ApiError(402, false, 'User is not logged in!');
    }

    const sessionUser: User = session.user as User;
    const userId = new mongoose.Types.ObjectId(sessionUser._id); // converting the normal string to mongoDB ObjectId

    if (sessionUser.role !== 'teacher') {
        return ApiError(403, false, 'You are not authorized to update a set');
    }

    try {
        const { questions } = await request.json();
        if (!questions) {
            return ApiError(400, false, 'Invalid or missing question set');
        }

        const validationResult = questionSchema.safeParse({ questions });

        if (!validationResult.success) {
            const formatted: ZodFormattedError<
                z.infer<typeof questionSchema>,
                string
            > = validationResult.error.format();

            const errors: Record<string, string> = {};

            // Collect all error messages of different attribute (name, email, password, role) from the formatted result
            for (const key in formatted) {
                const field = formatted[key as keyof typeof formatted];
                if (field && '_errors' in field && field._errors.length > 0) {
                    errors[key] = field._errors.join(', '); // or join(", ") if you want all messages
                }
            }

            const combinedErrorMessage = Object.values(errors).join(' | ');

            return ApiError(401, false, combinedErrorMessage);
        }

        const { searchParams } = new URL(request.url);
        const testId = searchParams.get('testId');
        const setId = searchParams.get('setId');
        if (!testId || !mongoose.isValidObjectId(testId)) {
            return ApiError(400, false, 'Invalid or missing test ID');
        }
        if (!setId || !mongoose.isValidObjectId(setId)) {
            return ApiError(400, false, 'Invalid question set ID');
        }

        const test = await TestModel.findById(testId);
        if (!test) return ApiError(400, false, 'Test not found!');

        // Add the new question set to the test
        const set = test.sets.find((set: questionSetsI) => set._id === setId);
        const setIndex = test.sets.findIndex(
            (set: questionSetsI) => set._id === setId
        );
        if (!set) return ApiError(404, false, 'Question set not found!');

        // Update the set in the test's sets array
        set.questions = questions;
        test.sets[setIndex] = set;

        // Save the updated test
        await test.save();

        return ApiResponse<questionSetsI>(
            200,
            true,
            'Question set added successfully!',
            test.sets[setIndex]
        );
    } catch (error) {
        console.error('Error updating question set:', error);
        return ApiError(500, false, 'Internal Server Error');
    }
}
// Delete set
export async function DELETE(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return ApiError(402, false, 'User is not logged in!');
    }

    const sessionUser: User = session.user as User;
    const userId = new mongoose.Types.ObjectId(sessionUser._id); // converting the normal string to mongoDB ObjectId

    if (sessionUser.role !== 'teacher') {
        return ApiError(403, false, 'You are not authorized to delete a set');
    }

    try {
        const { searchParams } = new URL(request.url);
        const testId = searchParams.get('testId');
        const setId = searchParams.get('setId');
        if (!testId || !mongoose.isValidObjectId(testId)) {
            return ApiError(400, false, 'Invalid or missing test ID');
        }
        if (!setId || !mongoose.isValidObjectId(setId)) {
            return ApiError(400, false, 'Invalid question set ID');
        }

        const test = await TestModel.findById(testId);
        if (!test) return ApiError(400, false, 'Test not found!');

        // Find the index of the set to be deleted
        const setIndex = test.sets.findIndex(
            (set: questionSetsI) => set._id === setId
        );
        if (setIndex === -1) {
            return ApiError(404, false, 'Question set not found!');
        }

        // Remove the set from the test's sets array
        test.sets.splice(setIndex, 1);

        // Save the updated test
        await test.save();

        return ApiResponse<questionSetsI>(
            200,
            true,
            'Question set deleted successfully!'
        );
    } catch (error) {
        console.error('Error deleting question set:', error);
        return ApiError(500, false, 'Internal Server Error');
    }
}
