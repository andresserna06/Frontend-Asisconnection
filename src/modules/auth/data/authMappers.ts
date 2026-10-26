import { AuthError, type FieldErrors } from '@/modules/auth/domain/models/AuthError';
import type { LoginField } from '@/modules/auth/domain/models/LoginCredentials';
import { isRoleCode, type RoleCode } from '@/modules/auth/domain/models/Role';
import type { User } from '@/modules/auth/domain/models/User';

// The exact response shapes are not documented yet (docs/api-auth.md), so these mappers
// accept the most likely field names and wrappers. Confirm them with the real backend.

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// The payload may come at the top level or wrapped in one of these keys.
function candidateObjects(json: unknown): JsonObject[] {
  if (!isObject(json)) {
    return [];
  }
  const wrapped = [json.usuario, json.user, json.data].filter(isObject);
  return [json, ...wrapped];
}

function pickString(objects: JsonObject[], keys: string[]): string | null {
  for (const object of objects) {
    for (const key of keys) {
      const value = object[key];
      if (typeof value === 'string' && value.trim() !== '') {
        return value;
      }
    }
  }
  return null;
}

function pickArray(objects: JsonObject[], keys: string[]): unknown[] {
  for (const object of objects) {
    for (const key of keys) {
      const value = object[key];
      if (Array.isArray(value)) {
        return value;
      }
    }
  }
  return [];
}

// Accepts ["ACUDIENTE"] or [{ nombre: "ACUDIENTE" }]; unknown roles are dropped.
export function parseRoles(values: unknown[]): RoleCode[] {
  const codes = values
    .map((value) => (isObject(value) ? pickString([value], ['nombre', 'name', 'rol']) : value))
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim().toUpperCase())
    .filter(isRoleCode);
  return [...new Set(codes)];
}

export function mapLoginResponse(json: unknown): string {
  const token = pickString(candidateObjects(json), ['token', 'accessToken', 'access_token']);
  if (token === null) {
    throw new AuthError('unknown');
  }
  return token;
}

export function mapProfileResponse(json: unknown): User {
  const objects = candidateObjects(json);
  const username = pickString(objects, ['username', 'nombreUsuario', 'usuario']);
  const email = pickString(objects, ['email', 'correo']);
  if (username === null || email === null) {
    throw new AuthError('unknown');
  }
  return { username, email, roles: parseRoles(pickArray(objects, ['roles'])) };
}

// Backend field name -> login form field.
const FIELD_NAMES: Record<string, LoginField> = {
  email: 'email',
  correo: 'email',
  clave: 'password',
  password: 'password',
};

function toMessage(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === 'string') ?? null;
  }
  return null;
}

// Accepts { errores: { clave: "..." } } or { errors: [{ campo: "clave", mensaje: "..." }] }.
export function mapFieldErrors(json: unknown): FieldErrors {
  const fieldErrors: FieldErrors = {};
  if (!isObject(json)) {
    return fieldErrors;
  }
  const details = json.errores ?? json.errors ?? json.detalles ?? json.details;

  const entries: [unknown, unknown][] = Array.isArray(details)
    ? details
        .filter(isObject)
        .map((item) => [item.campo ?? item.field, item.mensaje ?? item.message])
    : isObject(details)
      ? Object.entries(details)
      : [];

  for (const [name, rawMessage] of entries) {
    const field = typeof name === 'string' ? FIELD_NAMES[name] : undefined;
    const message = toMessage(rawMessage);
    if (field !== undefined && message !== null) {
      fieldErrors[field] = message;
    }
  }
  return fieldErrors;
}
