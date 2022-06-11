export class ServerError extends Error {
  constructor(reason: string) {
    super();
    this.message = reason;
  }
}

export class ClientError extends Error {
  public code: number;

  constructor(reason: string, code?: number) {
    super();
    this.message = reason;
    if (code !== undefined && code !== null) {
      this.code = code;
    } else {
      this.code = 400;
    }
  }
}
