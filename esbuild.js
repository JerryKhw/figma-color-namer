#!/usr/bin/env node
require("esbuild")
    .build({
        entryPoints: ["src/plugin/code.ts"],
        outdir: "dist",
        bundle: true,
    })
    .catch(() => process.exit(1));
