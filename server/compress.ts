const COMPRESSIBLE_CONTENT_TYPE_REGEX =
  /^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i;
const AVAILABLE_ENCODINGS = new Map<string, CompressionFormat>([
  // ["br", "brotli"],
  ["gzip", "gzip"],
  // ["zstd", "zstd"],
  // ["deflate", "deflate"],
]);
const CACHE_CONTROL_NO_TRANSFORM_REGEX = /(?:^|,)\s*?no-transform\s*?(?:,|$)/i;

const shouldCompress = (res: Response) => {
  const type = res.headers.get("Content-Type");
  return type && COMPRESSIBLE_CONTENT_TYPE_REGEX.test(type);
};
const shouldTransform = (res: Response) => {
  const cacheControl = res.headers.get("Cache-Control");
  return !cacheControl || !CACHE_CONTROL_NO_TRANSFORM_REGEX.test(cacheControl);
};

export const compress = (req: Request, res: Response) => {
  const contentLength = res.headers.get("Content-Length");
  if (
    !res.body ||
    res.headers.has("Content-Encoding") || // already encoded
    res.headers.has("Transfer-Encoding") || // already encoded or chunked
    req.method === "HEAD" || // HEAD request
    (contentLength && Number(contentLength) < 1024) || // content-length below threshold
    !shouldCompress(res) || // not compressible type
    !shouldTransform(res)
  ) {
    return res;
  }

  const accepted = req.headers.get("Accept-Encoding");
  let encoding: CompressionFormat | undefined;
  let encodingHeader: string | undefined;
  for (const [key, value] of AVAILABLE_ENCODINGS.entries()) {
    if (accepted?.includes(key)) {
      encoding = value;
      encodingHeader = key;
      break;
    }
  }
  if (!encoding || !encodingHeader) {
    return res;
  }

  const stream = new CompressionStream(encoding);
  res = new Response(res.body.pipeThrough(stream), res);
  res.headers.delete("Content-Length");
  res.headers.set("Content-Encoding", encodingHeader);

  return res;
};
