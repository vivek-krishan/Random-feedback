import ApiError from '@/helpers/ApiError';
import ApiResponse from '@/helpers/ApiResponse';
import dbConnect from '@/lib/dbConnection';
import UserModel from '@/models/User.model';
import { IMessage } from '@/models/User.model';

export async function POST(req: Request) {
    await dbConnect();

    try {
        const { username, content } = await req.json();
        if (!username || !content)
            return ApiError(404, false, 'All fields are required');

        if (typeof content !== 'string')
            ApiError(301, false, 'Content must be in string format');

        const messageData = { content, createdAt: new Date() };
        const user = await UserModel.findOne({ username });
        if (!user) return ApiError(404, false, 'User not found');

        user.messages.push(messageData as IMessage);

        return ApiResponse(201, true, 'Message sent successfully');
    } catch (error) {
        console.error('Internal server error: ', error);
        return ApiError(500, false, 'Internal server error!');
    }
}
