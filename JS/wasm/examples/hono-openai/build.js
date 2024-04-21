import { build } from "esbuild";
let runtime = process.argv[2];


build({
    entryPoints: ["src/index.js", "src/prompts/quote.jsonnet","src/prompts/config.jsonnet"],
    // entryPoints: ["src/index.js"],
    bundle: true,
    // minify: true,
    minifySyntax: true,
    // outfile: "bin/app.js",
    outdir: "bin",
    format: "esm",
    target: "esnext",
    platform: "node",
    // external: ["arakoo"],
    loader:{
        ".jsonnet":"copy"
    },
    define: {
        "process.env.arakoo": JSON.stringify(runtime === "arakoo"),
    },
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
