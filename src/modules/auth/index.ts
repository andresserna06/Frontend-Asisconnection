// Module public API. Other modules import only from here.
export { AppAuthProvider } from './AppAuthProvider';
export { useAuth } from './application/AuthProvider';
export type { AuthStatus } from './application/AuthProvider';
export { getPrimaryRole, ROLES } from './domain/models/Role';
export type { Role, RoleCode } from './domain/models/Role';
export type { User } from './domain/models/User';
export { LoginScreen } from './ui/LoginScreen';
export { RoleBadge } from './ui/RoleBadge';
