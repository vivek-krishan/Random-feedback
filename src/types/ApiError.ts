export interface ApiErrorInterface {
  status: number;
  success: boolean;
  message: string;
  error?: string;
  errors?: {
    [key: string]: string[];
  };
  data?: any;
  stack?: string;
}

