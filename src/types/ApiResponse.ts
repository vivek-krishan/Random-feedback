import { IMessage } from '@/models/User.model';

export interface ApiResponseInterface {
    status: number;
    success: boolean;
    message: string;
    messageData?: Array<IMessage>;
    data?: object;
    dataArray?: Array<object>;
    isAcceptingMessages?: boolean;
}
