function stripAccentsLower(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function isPlaceholderDisplayName(displayName: string, username?: string | null): boolean {
  const normalizedName = stripAccentsLower(displayName);
  if (normalizedName !== 'maria gomez') {
    return false;
  }
  const normalizedUsername = username ? stripAccentsLower(username) : '';
  return normalizedUsername.length > 0 && !normalizedUsername.startsWith('maria');
}

export function resolveAuthorDisplayName(
  displayName: string | null | undefined,
  username?: string | null,
): string {
  const trimmedName = displayName?.trim() ?? '';
  const trimmedUsername = username?.trim() ?? '';

  if (trimmedName.length === 0) {
    return trimmedUsername || 'Participante';
  }
  if (isPlaceholderDisplayName(trimmedName, trimmedUsername)) {
    return trimmedUsername;
  }
  return trimmedName;
}
