// Cloudflare Worker: reverse proxy
// - Webflow (origin): default for opmaint.com
// - Netlify (Astro): /blog (listing only), /procedure, /tools, /checklist, /demo, /api, /llm.txt, /.well-known/llm.txt, /assets, /images, /_astro, favicon.ico
// - /blogs/* (individual posts) stay on Webflow
//
// Deploy routes in Cloudflare Workers:
//   opmaint.com/*
//   www.opmaint.com/*
// Netlify custom domains: use only opmaint.netlify.app (not opmaint.com/www).

const NETLIFY_HOST = "opmaint.netlify.app";
const PUBLIC_HOST = "opmaint.com";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Always serve on apex (no www in the address bar)
    if (url.hostname === "www.opmaint.com") {
      url.hostname = PUBLIC_HOST;
      return Response.redirect(url.toString(), 301);
    }

    const path = url.pathname;

    const isAstroBlogListing =
      path === "/blog" || path.startsWith("/blog/");
    const shouldProxy =
      isAstroBlogListing ||
      path.startsWith("/procedure") ||
      path.startsWith("/tools") ||
      path.startsWith("/checklist") ||
      path.startsWith("/demo") ||
      path.startsWith("/api/") ||
      path === "/llm.txt" ||
      path === "/.well-known/llm.txt" ||
      path.startsWith("/assets") ||
      path.startsWith("/images") ||
      path.startsWith("/_astro") ||
      path === "/favicon.ico";

    if (!shouldProxy) {
      // Let Webflow (origin) handle: /, /blogs/*, and everything else
      return fetch(request);
    }

    return proxyToNetlify(request, url);
  },
};

function shouldAddTrailingSlash(pathname) {
  if (pathname === "/" || pathname.endsWith("/")) return false;
  const lastSegment = pathname.split("/").pop() ?? "";
  return !lastSegment.includes(".");
}

async function proxyToNetlify(request, url) {
  let pathname = url.pathname;
  if (shouldAddTrailingSlash(pathname)) {
    pathname += "/";
  }

  // Do not forward client Host / forwarded headers — Netlify 404s when Host is opmaint.com
  const headers = new Headers();
  for (const name of ["Accept", "Accept-Language", "Content-Type", "Authorization"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  let currentUrl = `https://${NETLIFY_HOST}${pathname}${url.search}`;

  for (let hops = 0; hops < 5; hops++) {
    const response = await fetch(currentUrl, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("Location");
      if (!location) return response;

      const next = new URL(location, currentUrl);
      next.hostname = NETLIFY_HOST;
      next.protocol = "https:";
      currentUrl = next.toString();
      continue;
    }

    return rewriteNetlifyResponse(response);
  }

  return new Response("Too many redirects", { status: 502 });
}

function rewriteNetlifyResponse(response) {
  const outHeaders = new Headers(response.headers);
  const location = outHeaders.get("Location");
  if (location) {
    outHeaders.set("Location", rewritePublicUrl(location));
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: outHeaders,
  });
}

function rewritePublicUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.hostname === NETLIFY_HOST || parsed.hostname === PUBLIC_HOST) {
      parsed.hostname = PUBLIC_HOST;
      parsed.protocol = "https:";
      return parsed.toString();
    }
    return rawUrl;
  } catch {
    return rawUrl;
  }
}
