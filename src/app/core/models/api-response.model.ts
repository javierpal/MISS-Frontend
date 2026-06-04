/** Generic API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
}

/** Single validation error from API */
export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}
