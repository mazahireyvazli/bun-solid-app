import { textToDataURL } from "@/build/loaders/dataurl.loader";

export const minifySVG = (content: string): string => {
  return (
    content
      // Remove XML declaration
      .replace(/<\?xml[^?]*\?>/g, "")
      // Remove comments
      .replace(/<!--[\s\S]*?-->/g, "")
      // Remove whitespace between tags
      .replace(/>\s+</g, "><")
      // Collapse multiple spaces
      .replace(/\s+/g, " ")
      // Trim
      .trim()
  );
};

export const svgToDataURL = (content: string, minify: boolean): string => {
  if (minify) {
    return textToDataURL(minifySVG(content), "image/svg+xml");
  }

  return textToDataURL(content, "image/svg+xml");
};

export const bundleSVG = (content: string, minify: boolean) => {
  if (minify) {
    return minifySVG(content);
  }

  return content;
};
