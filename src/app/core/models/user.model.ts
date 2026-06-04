export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface RawAuthUser {
  id: string;
  email: string;
  role: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: RawAuthUser;
}
