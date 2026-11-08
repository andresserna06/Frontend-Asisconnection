import type { EcosystemLink } from './models/EcosystemLink';

export type EcosystemService = {
  listLinks(): Promise<EcosystemLink[]>;
};
