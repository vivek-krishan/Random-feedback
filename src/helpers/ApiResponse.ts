import { ApiResponseInterface } from '@/types/ApiResponse';
import { IMessage } from '@/models/User.model';

function ApiResponse(
    status: number,
    success: boolean,
    message: string,
    messageData?: Array<IMessage>,
    data?: object,
    dataArray?: Array<object>,
    isAcceptingMessages?: boolean
): Response {
    const successData: ApiResponseInterface = {
        status,
        success,
        message,
        messageData,
        data,
        dataArray,
        isAcceptingMessages,
    };

    return Response.json(successData, { status: status });
}

export default ApiResponse;
