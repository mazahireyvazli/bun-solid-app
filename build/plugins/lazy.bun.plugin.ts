import { resolveSync } from "bun";
import { dirname, relative } from "node:path";

import lazyModuleUrlPlugin, { LAZY_PLACEHOLDER_PREFIX } from "./lazy.babel.plugin";

const PLACEHOLDER_RE = new RegExp(`(["'])${LAZY_PLACEHOLDER_PREFIX}([^"']+)\\1`, "g");

type MetafileOutput = { entryPoint?: string };

export const createLazyTransform = () => {
  const sources = new Set<string>();

  const resolvePlaceholders = (code: string, filename: string) => {
    return code.replace(PLACEHOLDER_RE, (_match, quote: string, specifier: string) => {
      const resolved = resolveSync(specifier, dirname(filename));
      const key = relative(process.cwd(), resolved);
      sources.add(key);
      return `${quote}${key}${quote}`;
    });
  };

  const buildManifest = (outputs: Record<string, MetafileOutput>) => {
    const manifest: Record<string, { file: string }> = {};
    for (const [outPath, meta] of Object.entries(outputs)) {
      if (!meta.entryPoint || !sources.has(meta.entryPoint)) continue;
      manifest[meta.entryPoint] = { file: outPath };
    }
    return manifest;
  };

  return {
    babelPlugin: lazyModuleUrlPlugin,
    resolvePlaceholders,
    buildManifest,
  };
};
