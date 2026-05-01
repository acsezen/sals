import type { Options } from "tsup";
import { readFileSync } from "node:fs";
import { builtinModules } from "node:module";

const pkg = JSON.parse(readFileSync("./package.json", "utf8")) as {
  version: string;
};

export const tsup: Options = {
  clean: true,
  dts: true,
  entry: ["src/cli.ts", "src/server.ts"],
  format: ["esm", "cjs"],
  outDir: "dist",
  splitting: false,
  bundle: true,
  skipNodeModulesBundle: false,
  noExternal: [/./],
  external: builtinModules,
  define: {
    PACKAGE_VERSION: JSON.stringify(pkg.version)
  }
};
