import type { HttpStatus } from "../deps.ts";

export class HttpError extends Error {
  constructor(public readonly status: HttpStatus, message: string) {
    super(message);
  }
}
