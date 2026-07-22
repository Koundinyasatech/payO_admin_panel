// export function normalizeDocUrl(url) {
//   if (!url) return url;
//   if (url.startsWith('http://') || url.startsWith('https://')) {
//     return url;
//   }
//   // If it's a relative URL, you could prepend the API base, but we don't need that now.
//   return url;
// }
export function normalizeDocUrl(url) {
  if (!url) return url;
  // Force HTTPS to avoid mixed content
  return url.replace(/^http:\/\//i, 'https://');
}