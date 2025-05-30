import { ApiResponseInterface } from '@/types/ApiResponse';

function ApiResponse<T>(
    status: number,
    success: boolean,
    message: string,
    data?: T,
    dataArray?: T[]
): Response {
    const successData: ApiResponseInterface<T> = {
        status,
        success,
        message,
        data,
        dataArray,
    };

    return Response.json(successData, { status: status });
}

export default ApiResponse;
