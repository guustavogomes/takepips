export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

