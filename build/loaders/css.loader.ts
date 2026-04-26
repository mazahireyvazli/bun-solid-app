import { bundle } from "lightningcss";

export const bundleCSS = (filename: string, minify: boolean) => {
  return bundle({
    filename,
    minify,
    sourceMap: false,
  });
};
