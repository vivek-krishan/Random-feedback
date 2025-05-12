import dbConnect from '@/lib/dbConnection';
import UserModel from '@/models/User.model';
import { z } from 'zod';
import { verifySchema } from '@/schemas/verify.Schema';
import ApiError from '@/helpers/ApiError';
import ApiResponse from '@/helpers/ApiResponse';

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, code } = await request.json();

        if (!username || !code) ApiError(404, false, 'All fields are required');

        const result = verifySchema.safeParse({ code });

        if (!result.success) {
            const codeError = result.error.format().code?._errors || [];
            return ApiError(
                401,
                false,
                codeError?.length > 0
                    ? codeError?.join(', ')
                    : 'Otp validation failed'
            );
        }

        const user = await UserModel.findOne({ username });
        if (!user) return ApiError(404, false, 'User not found!');

        if (user.isVerified) {
            return ApiError(402, false, 'User is already verified!');
        }

        const isValidCode = user.verificationToken === code;
        const isExpired = new Date(user.verificationTokenExpiry) > new Date();

        if (!isValidCode) {
            return ApiError(401, false, 'Otp is not correct!');
        }
        if (isExpired) {
            return ApiError(401, false, 'Otp is expired! Please sign-up again');
        }

        user.isVerified = true;
        await user.save();

        // Extracting those fields which I don't want to sent to the frontend from the user
        const userData = (({
            verificationToken,
            verificationTokenExpiry,
            password,
            ...object
        }) => object)(user); // Remove properties verificationToken, verificationTokenExpiry, and password

        return ApiResponse(
            201,
            true,
            'User verified successfully',
            [],
            userData
        );
    } catch (error) {
        console.error('Error in verifying the user', error);
        return ApiError(401, false, 'Error in verifying the user');
    }
}
