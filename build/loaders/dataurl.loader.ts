export const textToDataURL = (content: string, mimeType: string) => {
  return `data:${mimeType};utf8,${encodeURIComponent(content)}`;
};
