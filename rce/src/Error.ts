export class ServerError extends Error {
  constructor(reason: string) {
    super();
    this.message = reason;
  }
}

export class ClientError extends Error {
  public readonly code: number;

  constructor(reason: string, code = 400) {
    super(reason);
    this.code = code;
  }
}
