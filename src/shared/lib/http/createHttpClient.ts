import { HttpError } from './HttpError';

// Render may take a while to wake up on the first request.
const REQUEST_TIMEOUT_MS = 30_000;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpRequestOptions = {
  method?: HttpMethod;
  // Sent as JSON.
  body?: unknown;
  // Session token for protected routes. Never log it.
  token?: string;
};

// The only place in the app that calls fetch. Data layers receive an HttpClient and
// type each response according to the backend contract.
export type HttpClient = {
  // Resolves with the parsed JSON body (null when empty); rejects with HttpError.
  request<T>(path: string, options?: HttpRequestOptions): Promise<T>;
};

export function createHttpClient(baseUrl: string): HttpClient {
  return {
    async request<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (options.body !== undefined) {
        headers['Content-Type'] = 'application/json';
      }
      if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      let response: Response;
      try {
        response = await fetch(`${baseUrl}${path}`, {
          method: options.method ?? 'GET',
          headers,
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });
      } catch {
        throw new HttpError(null);
      } finally {
        clearTimeout(timeout);
      }

      const json: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new HttpError(response.status, json);
      }
      return json as T;
    },
  };
}
