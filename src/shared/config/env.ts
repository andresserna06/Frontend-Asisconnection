// Backend base URL without trailing slash, or null when EXPO_PUBLIC_API_URL is not set.
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_URL = rawApiUrl ? rawApiUrl.replace(/\/+$/, '') : null;
