import { useEffect, useState } from 'react';

import type { EcosystemService } from '@/modules/ecosystem/domain/EcosystemService';
import {
  PUBLISHED_PROJECT_URLS,
  type EcosystemLink,
} from '@/modules/ecosystem/domain/models/EcosystemLink';

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function useEcosystemLinks(service: EcosystemService) {
  const [linksByKey, setLinksByKey] = useState<Record<string, EcosystemLink>>({});

  useEffect(() => {
    let isActive = true;

    service
      .listLinks()
      .then((links) => {
        if (!isActive) {
          return;
        }
        const map: Record<string, EcosystemLink> = {};
        for (const link of links) {
          map[normalizeKey(link.projectName)] = link;
        }
        setLinksByKey(map);
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, [service]);

  function findLinkForTitle(title: string): EcosystemLink | null {
    const key = normalizeKey(title);
    const link = linksByKey[key] ?? null;
    const publishedUrl = PUBLISHED_PROJECT_URLS[key];
    if (publishedUrl === undefined) {
      return link;
    }
    return { id: key, projectName: title, description: link?.description ?? '', url: publishedUrl };
  }

  return { findLinkForTitle };
}
