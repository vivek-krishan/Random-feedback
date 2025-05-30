import dbConnect from '@/lib/dbConnection';
import UserModel from '@/models/user.model';
import { User } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/option';
import { getServerSession } from 'next-auth';
import ApiError from '@/helpers/ApiError';
import ApiResponse from '@/helpers/ApiResponse';
import mongoose from 'mongoose';
import TestModel, { TestI } from '@/models/test.model';
import { createTestSchema } from '@/schemas/test/createTest.schema';
import { z, ZodFormattedError } from 'zod';

// This file handles the API routes for tests, including getting a test by ID, creating, updating, and deleting tests.

// get test by id
export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return ApiError(402, false, 'User is not logged in!');
    }

    try {
        const { searchParams } = new URL(request.url);
        const testId = searchParams.get('testid');

        if (!testId) {
            return ApiError(404, false, 'Test ID is required');
        }

        const test = await TestModel.findById(testId);
        if (!test) {
            return ApiError(404, false, 'Test not found');
        }

        return ApiResponse<TestI>(
            200,
            true,
            'Test retrieved successfully',
            test
        );
    } catch (error) {
        console.error('Error in getting test:', error);
        return ApiError(500, false, 'Internal server error');
    }
}
// Create test
export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return ApiError(402, false, 'User is not logged in!');
    }

    const sessionUser: User = session.user as User;
    const userId = new mongoose.Types.ObjectId(sessionUser._id); // converting the normal string to mongoDB ObjectId

    if (sessionUser.role !== 'teacher') {
        return ApiError(403, false, 'You are not authorized to create a test');
    }

    try {
        const { title, topic, startTime, endTime } = await request.json();

        if (!title || !topic || !startTime || !endTime)
            return ApiError(400, false, 'All fields must be provided');

        const validationResult = createTestSchema.safeParse({
            title,
            topic,
            timing: {
                start: startTime,
                end: endTime,
            },
            teacher: sessionUser._id,
        });

        if (!validationResult.success) {
            const formatted: ZodFormattedError<
                z.infer<typeof createTestSchema>,
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

        const newTest = await TestModel.create({
            title,
            topic,
            timing: {
                start: new Date(startTime),
                end: new Date(endTime),
            },
            teacher: sessionUser._id,
        });

        if (!newTest)
            return ApiError(
                500,
                false,
                'Failed to create test due to some internal error! Please try again'
            );

        const user = await UserModel.findById(userId);
        if (!user) return ApiError(404, false, 'User not found');

        user.allTests?.push(newTest._id as mongoose.Types.ObjectId);
        await user.save();

        return ApiResponse<TestI>(
            201,
            true,
            'Test created successfully',
            newTest
        );
    } catch (error) {
        console.error('Error in creating test:', error);
        return ApiError(500, false, 'Internal server error');
    }
}
// Update test
export async function PATCH(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return ApiError(402, false, 'User is not logged in!');
    }

    const sessionUser: User = session.user as User;
    const userId = new mongoose.Types.ObjectId(sessionUser._id); // converting the normal string to mongoDB ObjectId

    if (sessionUser.role !== 'teacher') {
        return ApiError(403, false, 'You are not authorized to update a test');
    }

    try {
        const { title, topic, startTime, endTime } = await request.json();

        if (!startTime || !endTime || !title || !topic)
            return ApiError(400, false, 'All fields must be provided');

        const validationResult = createTestSchema.safeParse({
            title,
            topic,
            timing: {
                start: startTime,
                end: endTime,
            },
            teacher: sessionUser._id,
        });

        if (!validationResult.success) {
            const formatted: ZodFormattedError<
                z.infer<typeof createTestSchema>,
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
        const testId = searchParams.get('testid');

        if (!testId) return ApiError(404, false, 'Test ID is required');

        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return ApiError(400, false, 'Invalid Test ID format');
        }

        const test = await TestModel.findByIdAndUpdate(
            testId,
            {
                timing: {
                    start: startTime,
                    end: endTime,
                },
                title,
                topic,
            },
            { new: true }
        );

        if (!test) return ApiError(404, false, 'Test not found!');

        return ApiResponse<TestI>(201, true, 'Test updated successfully', test);
    } catch (error) {
        console.error('Error in updating test:', error);
        return ApiError(500, false, 'Internal server error');
    }
}
// Delete test
export async function DELETE(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return ApiError(402, false, 'User is not logged in!');
    }

    const sessionUser: User = session.user as User;
    const userId = new mongoose.Types.ObjectId(sessionUser._id); // converting the normal string to mongoDB ObjectId

    if (sessionUser.role !== 'teacher') {
        return ApiError(403, false, 'You are not authorized to delete a test');
    }

    try {
        const { searchParams } = new URL(request.url);
        const testId = searchParams.get('testid');

        if (!testId) return ApiError(404, false, 'Test ID is required');
        // Validate the testId format
        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return ApiError(400, false, 'Invalid Test ID format');
        }

        const test = await TestModel.findById(testId);
        if (!test) return ApiError(404, false, 'Test not found!');

        // Searching if any student has attempted this test or not
        // If any student has attempted this test, we will not delete it
        const attemptedUsers = await UserModel.find({
            role: 'student',
            allTests: { $in: [testId] },
        });

        if (attemptedUsers.length > 0) {
            return ApiError(
                403,
                false,
                'Test cannot be deleted as it has been attempted by students'
            );
        }

        // Remove the test from the user's allTests array
        const user = await UserModel.findById(userId);
        if (!user) return ApiError(404, false, 'User not found');

        user.allTests = user.allTests?.filter(
            (testIdObj) => testIdObj.toString() !== testId
        );
        user.save();

        // Delete the test from the database
        const deletedTest = await TestModel.findByIdAndDelete(testId);
        if (!deletedTest) return ApiError(400, false, 'Test not found!');

        return ApiResponse<TestI>(200, true, 'Test deleted successfully');
    } catch (error) {
        console.error('Error in deleting test:', error);
        return ApiError(500, false, 'Internal server error');
    }
}
