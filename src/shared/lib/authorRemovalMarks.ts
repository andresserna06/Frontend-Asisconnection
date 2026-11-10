// Temporary, until the backend has a delete route. Only the owner can edit their profile, so the
// content they removed travels in the fragment of their avatar URL: it reaches every client next
// to each post and comment, cannot be forged for someone else, and image requests ignore it.
const MARK_SEPARATOR = '#removed=';
const NO_PHOTO_URL = 'https://avatar.invalid/none';
const MAX_AVATAR_LENGTH = 500;
const SHORT_ID_LENGTH = 8;

export type RemovableKind = 'post' | 'comment';

function toEntry(kind: RemovableKind, id: string): string {
  return `${kind === 'post' ? 'p' : 'c'}${id.replace(/-/g, '').slice(0, SHORT_ID_LENGTH)}`;
}

function parse(rawAvatar: string | null | undefined): { photo: string | null; entries: string[] } {
  if (!rawAvatar) {
    return { photo: null, entries: [] };
  }
  const separatorIndex = rawAvatar.indexOf(MARK_SEPARATOR);
  const base = separatorIndex === -1 ? rawAvatar : rawAvatar.slice(0, separatorIndex);
  const marks =
    separatorIndex === -1 ? '' : rawAvatar.slice(separatorIndex + MARK_SEPARATOR.length);
  return {
    photo: base === NO_PHOTO_URL ? null : base,
    entries: marks.split(',').filter(Boolean),
  };
}

function serialize(photo: string | null, entries: string[]): string | null {
  if (photo === null && entries.length === 0) {
    return null;
  }
  const marks = entries.length > 0 ? `${MARK_SEPARATOR}${entries.join(',')}` : '';
  return `${photo ?? NO_PHOTO_URL}${marks}`;
}

export function getAvatarPhotoUrl(rawAvatar: string | null | undefined): string | null {
  return parse(rawAvatar).photo;
}

export function isRemovedByAuthor(
  rawAvatar: string | null | undefined,
  kind: RemovableKind,
  id: string,
): boolean {
  return parse(rawAvatar).entries.includes(toEntry(kind, id));
}

export function countPostsRemovedByAuthor(rawAvatar: string | null | undefined): number {
  return parse(rawAvatar).entries.filter((entry) => entry.startsWith('p')).length;
}

// Null when the field has no room for another mark.
export function addRemovedContent(
  rawAvatar: string | null | undefined,
  kind: RemovableKind,
  id: string,
): string | null {
  const { photo, entries } = parse(rawAvatar);
  const entry = toEntry(kind, id);
  const next = serialize(photo, entries.includes(entry) ? entries : [...entries, entry]);
  return next !== null && next.length <= MAX_AVATAR_LENGTH ? next : null;
}

// Changing the photo must keep what was removed; only an overflow drops the oldest marks.
export function replaceAvatarPhoto(
  rawAvatar: string | null | undefined,
  photo: string | null,
): string | null {
  const entries = [...parse(rawAvatar).entries];
  let next = serialize(photo, entries);
  while (next !== null && next.length > MAX_AVATAR_LENGTH && entries.length > 0) {
    entries.shift();
    next = serialize(photo, entries);
  }
  return next;
}
