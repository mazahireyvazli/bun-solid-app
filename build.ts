import { transformAsync } from "@babel/core";
import { $, build, resolveSync, write, type BuildConfig, type Target } from "bun";
import { bundle } from "lightningcss";
import { rm } from "node:fs/promises";
import { parseArgs, type ParseArgsConfig } from "node:util";

const start = performance.now();

const importmap = {
  imports: {
    "solid-js": "https://esm.sh/solid-js@1.9.12",
    "solid-js/web": "https://esm.sh/solid-js@1.9.12/web",
    "solid-js/store": "https://esm.sh/solid-js@1.9.12/store",
    "@solidjs/router": "https://esm.sh/@solidjs/router@0.16.1?deps=solid-js@1.9.12",
    "@solidjs/meta": "https://esm.sh/@solidjs/meta@0.29.4?deps=solid-js@1.9.12",
  },
};

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    ssr: {
      type: "boolean",
      default: false,
    },
    target: {
      type: "string",
      default: "browser",
    },
    entrypoints: {
      type: "string",
      default: ["./index.html"],
      multiple: true,
    },
    outdir: {
      type: "string",
      default: "./out",
    },
    minify: {
      type: "boolean",
      default: true,
    },
    features: {
      type: "string",
      default: [],
      multiple: true,
    },
  },
  strict: true,
  allowPositionals: true,
  allowNegative: true,
} satisfies ParseArgsConfig);

const OUT_DIR = values.outdir;
const ENTRYPOINTS = values.entrypoints;
const SSR = values.ssr;
const TARGET = values.target as Target;
const MINIFY = values.minify;
const FEATURES = values.features;

const SSR_FEATURE = SSR ? ["SSR"] : [];
const RESOLVED_FEATURES = [...FEATURES, ...SSR_FEATURE];

const DEV = RESOLVED_FEATURES.includes("IS_DEV");

const shouldMinify = (minify: BuildConfig["minify"]) => {
  return minify ? minify === true || minify.whitespace === true : false;
};

const buildConfig = {
  outdir: OUT_DIR,
  entrypoints: ENTRYPOINTS,
  format: "esm",
  target: TARGET,
  minify: MINIFY,
  splitting: true,
  features: RESOLVED_FEATURES,
  // packages: SSR ? undefined : "external",
  external: SSR ? [] : Object.keys(importmap.imports),
  metafile: true,
  env: "PUBLIC_*",
  // publicPath: "/cdn/gen/",
  naming: {
    entry: "[dir]/[name].[ext]",
    chunk: "chunks/[name]-[hash].[ext]",
    asset: "assets/[name]-[hash].[ext]",
  },
  plugins: [
    {
      name: "solid-plugin",
      setup(build) {
        build.onLoad({ filter: /\.[jt]sx$/ }, async (args) => {
          const source = await Bun.file(args.path).text();
          const result = await transformAsync(source, {
            filename: args.path,
            presets: [["solid", { generate: SSR ? "ssr" : "dom", hydratable: true }]],
            parserOpts: {
              plugins: ["typescript", "jsx"],
            },
          });
          return {
            contents: result?.code ?? "",
            loader: "ts",
          };
        });
      },
    },
    {
      name: "inline-css-plugin",
      setup(build) {
        build.onResolve({ filter: /\.css\?inline$/ }, (args) => {
          const resolvedPath = resolveSync(args.path, args.resolveDir);

          const filePath = resolvedPath.replace("?inline", "");

          return { path: filePath, namespace: "inline-css" };
        });

        build.onLoad({ filter: /\.css$/, namespace: "inline-css" }, async (args) => {
          const result = bundle({
            filename: args.path,
            minify: shouldMinify(build.config.minify),
            sourceMap: false,
          });

          return {
            contents: result.code.toString(),
            loader: "text",
          };
        });
      },
    },
    {
      name: "transform-html-plugin",
      setup(build) {
        const tagRewriter = new HTMLRewriter().on("*", {
          async element(element) {
            if (element.tagName === "script" && element.hasAttribute("inline")) {
              const src = element.getAttribute("src");
              if (src) {
                const code = new Bun.Transpiler({
                  loader: "ts",
                  minifyWhitespace: shouldMinify(build.config.minify),
                }).transformSync(await Bun.file(src).arrayBuffer());
                element.setInnerContent(code, { html: true });
                element.setAttribute("type", "text/javascript");
                element.removeAttribute("src");
              }
            }
            if (element.tagName === "script" && element.getAttribute("type") === "importmap") {
              element.setInnerContent(JSON.stringify(importmap, null, shouldMinify(build.config.minify) ? 0 : 2));
            }

            if (element.tagName === "style" && element.hasAttribute("inline")) {
              const src = element.getAttribute("src");
              if (src) {
                const result = bundle({
                  filename: src,
                  minify: shouldMinify(build.config.minify),
                  sourceMap: false,
                });
                element.setInnerContent(result.code.toString(), { html: true });
                element.removeAttribute("src");
              }
            }
          },
        });

        build.onLoad({ filter: /\.html$/ }, async (args) => {
          let html = await Bun.file(args.path).text();

          html = tagRewriter.transform(html);

          return {
            contents: html,
            loader: "html",
          };
        });
      },
    },
  ],
} satisfies BuildConfig;

if (!DEV) {
  await rm(OUT_DIR, { recursive: true, force: true });
}

const result = await build(buildConfig);

if (result.metafile) {
  console.table(
    Object.entries(result.metafile.outputs).map(([path, meta]) => ({ path, bytes: meta.bytes })),
    ["path", "bytes"],
  );

  void write(`${OUT_DIR}/meta.json`, JSON.stringify(result.metafile, null, 2));

  if (!SSR) {
    await $`cp -r ./public/ ${OUT_DIR}`;
  }
}

const end = performance.now();

console.log(`Build time: ${(end - start).toFixed(2)}ms`);
