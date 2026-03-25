// Cloudflare Worker: reverse proxy
// - Webflow (origin): default for opmaint.com
// - Netlify (Astro): /blog (listing only), /procedure, /tools, /checklist, /assets, /images, /_astro, favicon.ico
// - /blogs/* (individual posts) stay on Webflow

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    const isAstroBlogListing =
      path === "/blog" || path.startsWith("/blog/");
    const shouldProxy =
      isAstroBlogListing ||
      path.startsWith("/procedure") ||
      path.startsWith("/tools") ||
      path.startsWith("/checklist") ||
      path.startsWith("/assets") ||
      path.startsWith("/images") ||
      path.startsWith("/_astro") ||
      path === "/favicon.ico";

    if (!shouldProxy) {
      // Let Webflow (origin) handle: /, /blogs/*, and everything else
      return fetch(request);
    }

    const proxyUrl = new URL(request.url);
    proxyUrl.hostname = "opmaint.netlify.app";
    proxyUrl.protocol = "https:";

    const headers = new Headers(request.headers);
    headers.set("Host", "opmaint.netlify.app");

    const proxiedRequest = new Request(proxyUrl.toString(), {
      method: request.method,
      headers,
      body: request.body,
      redirect: "follow",
    });

    return fetch(proxiedRequest);
  },
};
