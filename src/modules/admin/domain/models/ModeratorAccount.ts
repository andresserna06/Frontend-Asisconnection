export type ModeratorAccount = {
  id: string;
  username: string;
  email: string;
  role: string;
  localRole?: string | null;
  displayName?: string | null;
};
