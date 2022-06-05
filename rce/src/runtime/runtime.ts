export class Runtime {
    constructor(
        public language: string,
        public version: string,
        public extension: string,
        public compiled: boolean,
        public buildCommand: string[],
        public runCommand: string[],
        public aliases: string[]
    ) {
        if (language === "" || version === "" || extension === "" || runCommand.length === 0 || aliases.length === 0) {
            throw new TypeError("Invalid runtime parameters");
        }

        if (compiled && buildCommand.length === 0) {
            throw new TypeError(
                "Invalid runtime parameters: buildCommand is empty yet compiled is true"
            );
        }
    }
}
