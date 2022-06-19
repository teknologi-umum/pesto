const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    format: "cjs",
    platform: "node",
    external: ["@ltd/j-toml", "@sentry/node", "polka", "yaml"],
    outdir: "./dist",
    target: ["esnext", "node16.14"],
    tsconfig: "tsconfig.json",
    sourcemap: true
  })
  .catch((e) => {
    /* eslint-disable-next-line */
    console.error(e);
    process.exit(1);
  });
