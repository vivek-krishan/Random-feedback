import dbConnect from '@/lib/dbConnection';
import UserModel from '@/models/User.model';
import { z } from 'zod';
import { usernameValidation } from '@/schemas/signUp.Schema';
import ApiError from '@/helpers/ApiError';
import ApiResponse from '@/helpers/ApiResponse';

const UsernameQuerySchema = z.object({
    username: usernameValidation,
});

export async function GET(request: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);

        const queryParams = {
            username: decodeURI(searchParams.get('username') || ''),
        };

        // validate the username if its sequence is correct or not
        const result = UsernameQuerySchema.safeParse(queryParams);

        if (!result.success) {
            const userValidationError =
                result.error.format().username?._errors || [];
            return ApiError(
                401,
                false,
                userValidationError?.length > 0
                    ? userValidationError?.join(', ')
                    : 'Username validation failed'
            );
        }

        const { username } = result.data;

        const existingUser = await UserModel.findOne({
            username,
            isVerified: true,
        });

        if (existingUser) {
            return ApiError(400, false, 'Username is already taken');
        }

        return ApiResponse(201, true, `${username} is available for you`);
    } catch (error) {
        console.error('Error checking unique username', error);
        return ApiError(400, false, 'Error checking unique username');
    }
}
