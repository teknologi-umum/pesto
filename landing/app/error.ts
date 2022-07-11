import type { Status as HttpStatus } from "http/http_status.ts";

export class HttpError extends Error {
  constructor(public readonly status: HttpStatus, message: string) {
    super(message);
  }
}
