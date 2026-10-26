import type { RoleCode } from './Role';

// Session user. Fields come from the auth contract (docs/api-auth.md);
// the backend response is mapped to this shape in the data layer.
export type User = {
  username: string;
  email: string;
  roles: RoleCode[];
};
