#!/usr/bin/env node
import process from "node:process";

declare const PACKAGE_VERSION: string;

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));

  if (args.has("--version")) {
    console.log(PACKAGE_VERSION);
    process.exit(0);
  }

  try {
    await import("./server.js");
  } catch (err: unknown) {
    console.error(err);
    process.exit(1);
  }
}

void main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
