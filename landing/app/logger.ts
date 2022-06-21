export function info(text: string) {
  console.info(`\x1b[1;34m[INFO]:\x1b[0m ${text}`);
}

export function error(text: string) {
  console.error(`\x1b[1;31m[ERROR]:\x1b[0m ${text}`);
}
