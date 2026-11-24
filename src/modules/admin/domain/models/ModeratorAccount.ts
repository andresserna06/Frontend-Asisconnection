export type ModeratorAccount = {
  id: string;
  actorId?: string | null;
  username: string;
  email: string;
  role: string;
  localRole?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  isActive?: boolean;
};
