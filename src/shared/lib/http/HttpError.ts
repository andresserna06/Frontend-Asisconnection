// Failed request. `status` is null when there was no response (offline or timeout).
// Each module's data layer translates it into its own domain error.
export class HttpError extends Error {
  readonly status: number | null;
  // Parsed JSON body of the error response, or null.
  readonly body: unknown;

  constructor(status: number | null, body: unknown = null) {
    super(status === null ? 'network' : `http ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}
