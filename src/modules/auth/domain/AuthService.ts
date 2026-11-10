import type { LoginCredentials } from './models/LoginCredentials';
import type { RoleCode } from './models/Role';
import type { Session } from './models/Session';
import type { User } from './models/User';

export type RegisterCredentials = {
  username: string;
  email: string;
  password: string;
  role: Exclude<RoleCode, 'MODERATOR'>;
  acceptConsent: boolean;
};

export type AnonymousCredentials = {
  acceptConsent: boolean;
  nickname?: string;
  roleTag?: RoleCode;
};

// Contract implemented by the services layer (HTTP). Methods reject with AuthError.
// There is no logout endpoint: the device token is local, so signing out only clears it.
export type AuthService = {
  // Returns the device session token and the user.
  login(credentials: LoginCredentials): Promise<Session>;
  register?(credentials: RegisterCredentials): Promise<Session>;
  loginAnonymous?(credentials: AnonymousCredentials): Promise<Session>;
  getProfile(token: string): Promise<User>;
};

// Where the session token is persisted (SecureStore in the app, memory in tests).
export type TokenStorage = {
  getToken(): Promise<string | null>;
  getIsAnonymous(): Promise<boolean>;
  saveToken(token: string, isAnonymous: boolean): Promise<void>;
  clearToken(): Promise<void>;
};
