export class Runtime {
  constructor(
    public readonly language: string,
    public readonly version: string,
    public latest: boolean,
    public readonly extension: string,
    public readonly compiled: boolean,
    public readonly buildCommand: string[],
    public readonly runCommand: string[],
    public readonly aliases: string[],
    public readonly environment: Record<string, string>,
    public readonly shouldLimitMemory: boolean,
    public readonly memoryLimit: number,
    public readonly processLimit: number,
    public readonly allowedEntrypoints: number
  ) {
    if (language === "" || version === "" || latest === undefined || extension === "" || runCommand.length === 0 || aliases.length === 0 || typeof environment !== "object" || allowedEntrypoints === 0) {
      throw new TypeError("Invalid runtime parameters");
    }

    if (compiled && buildCommand.length === 0) {
      throw new TypeError(
        "Invalid runtime parameters: buildCommand is empty yet compiled is true"
      );
    }

    if (shouldLimitMemory && memoryLimit <= 0) {
      throw new TypeError("Invalid runtime parameters: memoryLimit is 0 or less");
    }

    if (processLimit <= 0) {
      throw new TypeError("Invalid runtime parameters: processLimit is 0 or less");
    }
  }

  public markAsLatest() {
    this.latest = true;
  }
}
