import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    format: "esm",
    platform: "node",
    external: ["toml"],
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
