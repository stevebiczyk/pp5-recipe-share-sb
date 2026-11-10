const isLoopback = (hostname) => ["localhost", "127.0.0.1"].includes(hostname);

export const usesLocalApiProxy = (apiUrl, browserHostname, isDevelopment) => {
  if (!isDevelopment || !isLoopback(browserHostname)) return false;
  try {
    const target = new URL(apiUrl);
    return ["http:", "https:"].includes(target.protocol) && isLoopback(target.hostname);
  } catch {
    return false;
  }
};

// DRF pagination returns absolute backend URLs. Keep those on the local proxy too.
export const localApiRequestUrl = (requestUrl, apiUrl) => {
  if (!/^https?:\/\//i.test(requestUrl || "")) return requestUrl;
  const target = new URL(apiUrl);
  const request = new URL(requestUrl);
  const prefix = target.pathname.replace(/\/+$/, "");
  if (request.origin !== target.origin || (prefix && !request.pathname.startsWith(`${prefix}/`))) return requestUrl;
  return `${request.pathname.slice(prefix.length)}${request.search}`;
};
