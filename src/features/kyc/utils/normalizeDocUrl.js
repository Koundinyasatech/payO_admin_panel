export function normalizeDocUrl(url) {
  if (!url) return url;
  // Force HTTPS to avoid mixed content
  return url.replace(/^http:\/\//i, 'https://');
}