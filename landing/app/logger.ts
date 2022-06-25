function getTime() {
  return new Date(Date.now()).toLocaleString("en-GB");
}

export function info(text: string) {
  console.info(`${getTime()} \x1b[1;34m[INFO] ➤ \x1b[0;34m ${text}\x1b[0m`);
}

export function error(text: string) {
  console.error(`${getTime()} \x1b[1;31m[ERRO] ➤ \x1b[0;31m ${text}\x1b[0m`);
}
