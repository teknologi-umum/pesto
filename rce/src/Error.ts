export class ServerError extends Error {
  constructor(public readonly reason: string) {
    super(reason);
  }
}

export class ClientError extends Error {
  constructor(public readonly reason: string, public readonly code = 400) {
    super(reason);
    this.code = code;
  }
}
