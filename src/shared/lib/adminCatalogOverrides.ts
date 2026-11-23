import { readDeviceValue, writeDeviceValue } from './deviceStorage';

export type StoredFaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

export type StoredEcosystemLink = {
  id: string;
  projectName: string;
  url: string;
  description: string;
};

type CatalogOverrideState<T> = {
  upsertedById: Record<string, T>;
  deletedIds: string[];
};

const FAQ_OVERRIDES_STORAGE_KEY = 'admin_faq_overrides_v1';
const ECOSYSTEM_OVERRIDES_STORAGE_KEY = 'admin_ecosystem_overrides_v1';

let faqOverrideCache: CatalogOverrideState<StoredFaqItem> = {
  upsertedById: {},
  deletedIds: [],
};

let ecosystemOverrideCache: CatalogOverrideState<StoredEcosystemLink> = {
  upsertedById: {},
  deletedIds: [],
};

let isFaqHydrated = false;
let isEcosystemHydrated = false;

export function normalizeProjectKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function ensureFaqHydrated(): Promise<void> {
  if (isFaqHydrated) {
    return;
  }
  isFaqHydrated = true;
  const saved =
    await readDeviceValue<CatalogOverrideState<StoredFaqItem>>(FAQ_OVERRIDES_STORAGE_KEY);
  if (saved && saved.upsertedById && Array.isArray(saved.deletedIds)) {
    faqOverrideCache = saved;
  }
}

async function ensureEcosystemHydrated(): Promise<void> {
  if (isEcosystemHydrated) {
    return;
  }
  isEcosystemHydrated = true;
  const saved = await readDeviceValue<CatalogOverrideState<StoredEcosystemLink>>(
    ECOSYSTEM_OVERRIDES_STORAGE_KEY,
  );
  if (saved && saved.upsertedById && Array.isArray(saved.deletedIds)) {
    ecosystemOverrideCache = saved;
  }
}

export function hasFaqOverrides(): boolean {
  return (
    Object.keys(faqOverrideCache.upsertedById).length > 0 || faqOverrideCache.deletedIds.length > 0
  );
}

export function hasEcosystemOverrides(): boolean {
  return (
    Object.keys(ecosystemOverrideCache.upsertedById).length > 0 ||
    ecosystemOverrideCache.deletedIds.length > 0
  );
}

export function applyFaqOverrides(items: StoredFaqItem[]): StoredFaqItem[] {
  if (!hasFaqOverrides()) {
    return items;
  }
  const deletedSet = new Set(faqOverrideCache.deletedIds);
  const seenIds = new Set<string>();
  const merged: StoredFaqItem[] = [];

  for (const item of items) {
    if (deletedSet.has(item.id)) {
      continue;
    }
    const override = faqOverrideCache.upsertedById[item.id];
    merged.push(override ?? item);
    seenIds.add(item.id);
  }

  for (const [id, item] of Object.entries(faqOverrideCache.upsertedById)) {
    if (!seenIds.has(id) && !deletedSet.has(id)) {
      merged.push(item);
    }
  }

  return merged;
}

export async function saveFaqOverride(item: StoredFaqItem): Promise<StoredFaqItem> {
  await ensureFaqHydrated();
  faqOverrideCache = {
    upsertedById: {
      ...faqOverrideCache.upsertedById,
      [item.id]: item,
    },
    deletedIds: faqOverrideCache.deletedIds.filter((id) => id !== item.id),
  };
  await writeDeviceValue(FAQ_OVERRIDES_STORAGE_KEY, faqOverrideCache).catch(() => undefined);
  return item;
}

export async function removeFaqOverride(id: string): Promise<void> {
  await ensureFaqHydrated();
  const nextUpserted = { ...faqOverrideCache.upsertedById };
  delete nextUpserted[id];
  const nextDeleted = faqOverrideCache.deletedIds.includes(id)
    ? faqOverrideCache.deletedIds
    : [...faqOverrideCache.deletedIds, id];
  faqOverrideCache = {
    upsertedById: nextUpserted,
    deletedIds: nextDeleted,
  };
  await writeDeviceValue(FAQ_OVERRIDES_STORAGE_KEY, faqOverrideCache).catch(() => undefined);
}

export function applyEcosystemLinkOverrides(items: StoredEcosystemLink[]): StoredEcosystemLink[] {
  if (!hasEcosystemOverrides()) {
    return items;
  }
  const deletedSet = new Set(ecosystemOverrideCache.deletedIds);
  const seenIds = new Set<string>();
  const seenProjectKeys = new Set<string>();
  const merged: StoredEcosystemLink[] = [];

  const overridesByProjectKey: Record<string, StoredEcosystemLink> = {};
  for (const override of Object.values(ecosystemOverrideCache.upsertedById)) {
    overridesByProjectKey[normalizeProjectKey(override.projectName)] = override;
  }

  for (const item of items) {
    const projectKey = normalizeProjectKey(item.projectName);
    if (deletedSet.has(item.id) || deletedSet.has(projectKey)) {
      continue;
    }
    const override =
      ecosystemOverrideCache.upsertedById[item.id] ?? overridesByProjectKey[projectKey];
    const resolved = override ?? item;
    merged.push(resolved);
    seenIds.add(resolved.id);
    seenIds.add(item.id);
    seenProjectKeys.add(normalizeProjectKey(resolved.projectName));
  }

  for (const [id, item] of Object.entries(ecosystemOverrideCache.upsertedById)) {
    const projectKey = normalizeProjectKey(item.projectName);
    if (
      !seenIds.has(id) &&
      !seenProjectKeys.has(projectKey) &&
      !deletedSet.has(id) &&
      !deletedSet.has(projectKey)
    ) {
      merged.push(item);
      seenIds.add(id);
      seenProjectKeys.add(projectKey);
    }
  }

  return merged;
}

export function getEcosystemOverrideByTitle(title: string): StoredEcosystemLink | null {
  if (!hasEcosystemOverrides()) {
    return null;
  }
  const targetKey = normalizeProjectKey(title);
  for (const item of Object.values(ecosystemOverrideCache.upsertedById)) {
    if (normalizeProjectKey(item.projectName) === targetKey) {
      return item;
    }
  }
  return null;
}

export function isEcosystemProjectDeleted(title: string): boolean {
  if (!hasEcosystemOverrides()) {
    return false;
  }
  const targetKey = normalizeProjectKey(title);
  return ecosystemOverrideCache.deletedIds.includes(targetKey);
}

export async function saveEcosystemLinkOverride(
  item: StoredEcosystemLink,
): Promise<StoredEcosystemLink> {
  await ensureEcosystemHydrated();
  const projectKey = normalizeProjectKey(item.projectName);
  ecosystemOverrideCache = {
    upsertedById: {
      ...ecosystemOverrideCache.upsertedById,
      [item.id]: item,
    },
    deletedIds: ecosystemOverrideCache.deletedIds.filter(
      (entry) => entry !== item.id && entry !== projectKey,
    ),
  };
  await writeDeviceValue(ECOSYSTEM_OVERRIDES_STORAGE_KEY, ecosystemOverrideCache).catch(
    () => undefined,
  );
  return item;
}

export async function removeEcosystemLinkOverride(id: string, projectName?: string): Promise<void> {
  await ensureEcosystemHydrated();
  const projectKey = projectName ? normalizeProjectKey(projectName) : null;
  const nextUpserted: Record<string, StoredEcosystemLink> = {};
  for (const [key, value] of Object.entries(ecosystemOverrideCache.upsertedById)) {
    if (key === id) {
      continue;
    }
    if (projectKey && normalizeProjectKey(value.projectName) === projectKey) {
      continue;
    }
    nextUpserted[key] = value;
  }
  const nextDeleted = new Set(ecosystemOverrideCache.deletedIds);
  nextDeleted.add(id);
  if (projectKey) {
    nextDeleted.add(projectKey);
  }
  ecosystemOverrideCache = {
    upsertedById: nextUpserted,
    deletedIds: Array.from(nextDeleted),
  };
  await writeDeviceValue(ECOSYSTEM_OVERRIDES_STORAGE_KEY, ecosystemOverrideCache).catch(
    () => undefined,
  );
}

export function resetAdminCatalogOverridesForTesting(): void {
  faqOverrideCache = { upsertedById: {}, deletedIds: [] };
  ecosystemOverrideCache = { upsertedById: {}, deletedIds: [] };
  isFaqHydrated = false;
  isEcosystemHydrated = false;
}
