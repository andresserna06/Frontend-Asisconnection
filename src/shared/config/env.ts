// Backend base URL without trailing slash, or null when it is not configured yet
// (the app then uses mock repositories).
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_URL = rawApiUrl ? rawApiUrl.replace(/\/+$/, '') : null;
