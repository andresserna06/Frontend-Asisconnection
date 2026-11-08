import type { EcosystemService } from '@/modules/ecosystem/domain/EcosystemService';
import type { EcosystemLink } from '@/modules/ecosystem/domain/models/EcosystemLink';

export const TEST_ECOSYSTEM_LINKS: EcosystemLink[] = [
  {
    id: 'link-1',
    projectName: 'SUMA 21',
    url: 'https://suma21.fundacionasisco.org',
    description: 'Donaciones y financiación',
  },
];

export function createFakeEcosystemService(
  overrides: Partial<EcosystemService> = {},
): EcosystemService {
  return {
    listLinks: jest.fn(async () => TEST_ECOSYSTEM_LINKS),
    ...overrides,
  };
}
