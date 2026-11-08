import type { EcosystemService } from '@/modules/ecosystem/domain/EcosystemService';
import type { HttpClient } from '@/shared/lib/http';

type RedirectionLinkItemResponse = {
  id: string;
  project_name: string;
  url: string;
  description: string;
};

type RedirectionLinksPageResponse = {
  data: RedirectionLinkItemResponse[];
};

export function createEcosystemService(client: HttpClient): EcosystemService {
  return {
    async listLinks() {
      const page = await client.request<RedirectionLinksPageResponse>(
        '/directory/links?page=1&limit=50',
      );
      return page.data.map((item) => ({
        id: item.id,
        projectName: item.project_name,
        url: item.url,
        description: item.description,
      }));
    },
  };
}
