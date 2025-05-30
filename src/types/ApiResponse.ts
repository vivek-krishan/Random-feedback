export interface ApiResponseInterface<T = unknown> {
    status: number;
    success: boolean;
    message: string;
    data?: T;
    dataArray?: T[];
}
