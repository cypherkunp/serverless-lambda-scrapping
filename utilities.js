export function sanitizeURL(url = '') {
  let sanitizedUrl = url.endsWith('/') ? url.slice(0, url.length - 1) : url;
  return sanitizedUrl;
}
