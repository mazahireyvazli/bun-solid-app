import { transformAsync } from "@babel/core";
import { $, build, resolveSync, write, type BuildConfig, type Target } from "bun";
import { rm } from "node:fs/promises";
import path from "node:path";
import { parseArgs, type ParseArgsConfig } from "node:util";

import { bundleCSS } from "@/build/loaders/css.loader";
import { bundleSVG, svgToDataURL } from "@/build/loaders/svg.loader";
import { createLazyTransform } from "@/build/plugins/lazy.bun.plugin";

const start = performance.now();

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
      default: ["./src/index.html"],
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

/**
 * enable *external* in the build config below to import external dependencies from esm.sh instead of node_modules
 */
const esmURLBuilder = (packageName: string, version: string, filename: string, dev: boolean) => {
  return `https://esm.sh/*${packageName}@${version}/es2022/${filename}${dev ? ".development" : ""}.mjs`;
};

const importmap = {
  imports: {
    "@solidjs/signals": esmURLBuilder("@solidjs/signals", "2.0.0-beta.10", "signals", DEV),
    "solid-js": esmURLBuilder("solid-js", "2.0.0-beta.10", "solid-js", DEV),
    "@solidjs/web": esmURLBuilder("@solidjs/web", "2.0.0-beta.10", "web", DEV),
    "@solidjs/router": esmURLBuilder("@solidjs/router", "0.17.0-next.3", "router", DEV),
    "@solidjs/meta": esmURLBuilder("@solidjs/meta", "0.30.0-next.0", "meta", DEV),
    "@/src/libs/metahead": esmURLBuilder("@solidjs/meta", "0.30.0-next.0", "meta", DEV),
  },
};

const lazyTransform = createLazyTransform();

const buildConfig = {
  outdir: OUT_DIR,
  entrypoints: ENTRYPOINTS,
  format: "esm",
  target: TARGET,
  minify: MINIFY,
  splitting: true,
  features: RESOLVED_FEATURES,
  metafile: true,
  env: SSR ? "inline" : "PUBLIC_*",
  external: SSR ? [] : Object.keys(importmap.imports),
  naming: {
    entry: "[dir]/[name].[ext]",
    chunk: "chunks/[name]-[hash].[ext]",
    asset: "assets/[name]-[hash].[ext]",
  },
  plugins: [
    {
      name: "solid-plugin",
      setup(build) {
        build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
          const source = await Bun.file(args.path).text();
          const result = await transformAsync(source, {
            filename: args.path,
            presets: [["solid", { generate: SSR ? "ssr" : "dom", hydratable: true }]],
            plugins: [lazyTransform.babelPlugin],
            parserOpts: {
              plugins: ["typescript", "jsx"],
            },
          });
          const code = lazyTransform.resolvePlaceholders(result?.code ?? "", args.path);

          return {
            contents: code,
            loader: "ts",
          };
        });
      },
    },
    {
      name: "inline-plugin",
      setup(build) {
        build
          .onResolve({ filter: /\.*\?inline$/ }, (args) => {
            const resolvedPath = resolveSync(args.path, args.resolveDir);

            const filePath = resolvedPath.replace("?inline", "");

            return { path: filePath, namespace: "inline" };
          })
          .onLoad({ filter: /\.css$/, namespace: "inline" }, async (args) => {
            const result = bundleCSS(args.path, shouldMinify(build.config.minify));

            return {
              contents: result.code.toString(),
              loader: "text",
            };
          })
          .onLoad({ filter: /\.svg$/, namespace: "inline" }, async (args) => {
            const content = await Bun.file(args.path).text();
            const result = bundleSVG(content, shouldMinify(build.config.minify));

            return {
              contents: result,
              loader: "text",
            };
          });
      },
    },
    {
      name: "dataurl-plugin",
      setup(build) {
        build
          .onResolve({ filter: /\.*\?dataurl$/ }, (args) => {
            const resolvedPath = resolveSync(args.path, args.resolveDir);

            const filePath = resolvedPath.replace("?dataurl", "");

            return { path: filePath, namespace: "dataURL" };
          })
          .onLoad({ filter: /\.svg$/, namespace: "dataURL" }, async (args) => {
            const content = await Bun.file(args.path).text();
            const result = svgToDataURL(content, shouldMinify(build.config.minify));

            return {
              contents: result,
              loader: "text",
            };
          });
      },
    },
    {
      name: "transform-html-plugin",
      setup(build) {
        const resolveSrcPath = (src: string, base: string) => {
          return resolveSync(src, path.dirname(base));
        };

        const rewriter = (htmlPath: string) => {
          return new HTMLRewriter().on("*", {
            async element(element) {
              if (element.tagName === "script" && element.hasAttribute("inline")) {
                const src = element.getAttribute("src");
                if (src) {
                  const resolvedSrc = resolveSrcPath(src, htmlPath);
                  const code = new Bun.Transpiler({
                    loader: "ts",
                    minifyWhitespace: shouldMinify(build.config.minify),
                  }).transformSync(await Bun.file(resolvedSrc).arrayBuffer());
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
                  const resolvedSrc = resolveSrcPath(src, htmlPath);
                  const result = bundleCSS(resolvedSrc, shouldMinify(build.config.minify));
                  element.setInnerContent(result.code.toString(), { html: true });
                  element.removeAttribute("src");
                }
              }
            },
          });
        };

        build.onLoad({ filter: /\.html$/ }, async (args) => {
          let html = await Bun.file(args.path).text();

          html = rewriter(args.path).transform(html);

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
    const manifest = lazyTransform.buildManifest(result.metafile.outputs);
    void write(`${OUT_DIR}/manifest.json`, JSON.stringify(manifest, null, 2));

    await $`cp -r ./public/. ${OUT_DIR}`;
  }
}

console.log(`Build time: ${(performance.now() - start).toFixed(2)}ms`);
