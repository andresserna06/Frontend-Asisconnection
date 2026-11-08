import type { RoleCode } from './Role';

// Session user. Comes from the AsisConexión backend (login `user` or GET /actors/me);
// the response is typed in the services layer.
export type User = {
  username: string;
  roles: RoleCode[];
};
