import type { AuthService } from '@/modules/auth/domain/AuthService';
import {
  AuthError,
  type AuthErrorKind,
  type FieldErrors,
} from '@/modules/auth/domain/models/AuthError';
import { isRoleCode, type RoleCode } from '@/modules/auth/domain/models/Role';
import { type HttpClient, HttpError } from '@/shared/lib/http';

// Response bodies as the AsisConexión backend sends them (contracts/openapi.yaml).
// The backend owns their validation (DTOs), so the app only types them here.
type PublicUserResponse = {
  id: string;
  username: string;
  email: string;
  rol: string;
  external_roles?: string[];
  local_role?: string | null;
};
type AuthSessionResponse = {
  user: PublicUserResponse;
  device_token: string;
  synced_with_global_db: boolean;
};
type AnonymousSessionResponse = {
  device_token: string;
  session_id: string;
};
type ActorProfileResponse = {
  id: string;
  username: string;
  primary_role: string;
};
// RFC 7807 body of every error response.
type ProblemDetailsResponse = { errors?: { field: string; message: string }[] } | null;

// Backend field name -> login form field.
const FIELD_BY_BACKEND_NAME: Record<string, keyof FieldErrors> = {
  email: 'email',
  identifier: 'email',
  clave: 'password',
  accept_consent: 'acceptConsent',
};

function toRoles(candidates: (string | null | undefined)[]): RoleCode[] {
  const roles = candidates.filter((role): role is string => typeof role === 'string');
  return [...new Set(roles.filter(isRoleCode))];
}

function toFieldErrors(body: unknown): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const { field, message } of (body as ProblemDetailsResponse)?.errors ?? []) {
    const formField = FIELD_BY_BACKEND_NAME[field];
    if (formField !== undefined && fieldErrors[formField] === undefined) {
      fieldErrors[formField] = message;
    }
  }
  return fieldErrors;
}

// Translates a failed request into the auth domain error. `unauthorizedKind` is what a
// 401 means for the endpoint that failed.
function toAuthError(error: unknown, unauthorizedKind: AuthErrorKind): AuthError {
  if (!(error instanceof HttpError)) {
    return new AuthError('unknown');
  }
  switch (error.status) {
    case null:
    case 502:
      // 502: the central identity service (Render) is down or rate-limited.
      return new AuthError('network');
    case 400:
      return new AuthError('validation', toFieldErrors(error.body));
    case 401:
      return new AuthError(unauthorizedKind);
    case 403:
      return new AuthError('forbidden');
    default:
      return new AuthError('unknown');
  }
}

export function createAuthService(client: HttpClient): AuthService {
  return {
    async login({ email, password, acceptConsent }) {
      try {
        const { device_token, user } = await client.request<AuthSessionResponse>('/auth/login', {
          method: 'POST',
          body: { email, clave: password, accept_consent: acceptConsent },
        });
        return {
          token: device_token,
          user: {
            username: user.username,
            roles: toRoles([user.local_role, user.rol, ...(user.external_roles ?? [])]),
          },
        };
      } catch (error) {
        throw toAuthError(error, 'invalidCredentials');
      }
    },

    async getProfile(token) {
      try {
        const actor = await client.request<ActorProfileResponse>('/actors/me', { token });
        return { username: actor.username, roles: toRoles([actor.primary_role]) };
      } catch (error) {
        throw toAuthError(error, 'sessionExpired');
      }
    },

    async register({ username, email, password, role, acceptConsent }) {
      try {
        const { device_token, user } = await client.request<AuthSessionResponse>('/auth/registro', {
          method: 'POST',
          body: {
            username,
            email,
            clave: password,
            rol: role,
            accept_consent: acceptConsent,
          },
        });
        return {
          token: device_token,
          user: {
            username: user.username,
            roles: toRoles([user.local_role, user.rol, ...(user.external_roles ?? [])]),
          },
        };
      } catch (error) {
        throw toAuthError(error, 'invalidCredentials');
      }
    },

    async loginAnonymous({ acceptConsent, nickname, roleTag }) {
      try {
        const { device_token } = await client.request<AnonymousSessionResponse>(
          '/sessions/anonymous',
          {
            method: 'POST',
            body: {
              accept_consent: acceptConsent,
              ...(nickname ? { nickname } : {}),
              ...(roleTag ? { role_tag: roleTag } : {}),
            },
          },
        );
        return {
          token: device_token,
          user: {
            username: nickname ?? 'Invitado',
            roles: toRoles([roleTag ?? 'BENEFICIARIO']),
          },
        };
      } catch (error) {
        throw toAuthError(error, 'invalidCredentials');
      }
    },
  };
}
