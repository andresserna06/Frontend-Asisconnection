import type { LoginCredentials } from './models/LoginCredentials';
import type { User } from './models/User';

// Contract implemented by the services layer (HTTP). Methods reject with AuthError.
export type AuthService = {
  // Returns the session token.
  login(credentials: LoginCredentials): Promise<string>;
  logout(token: string): Promise<void>;
  getProfile(token: string): Promise<User>;
};

// Where the session token is persisted (SecureStore in the app, memory in tests).
export type TokenStorage = {
  getToken(): Promise<string | null>;
  saveToken(token: string): Promise<void>;
  clearToken(): Promise<void>;
};
