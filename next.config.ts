import type { NextConfig } from "next";

const pages = ["projects", "about", "contact"];

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return ["", "/ca"].flatMap((locale) => [
      ...[`${locale}/index`, `${locale}/index.html`, `/portfolio${locale}/index.html`].map((source) => ({
        source, destination: locale || "/", permanent: true,
      })),
      ...pages.flatMap((page) => [
        { source: `${locale}/${page}.html`, destination: `${locale}/${page}`, permanent: true },
        { source: `/portfolio${locale}/${page}.html`, destination: `${locale}/${page}`, permanent: true },
      ]),
    ]);
  },
  async rewrites() {
    // Keep the portfolio's document transitions independent of the dashboard's
    // React layout. The existing API and dashboard routes continue through Next.
    const assets = ["css/site.css", "js/site.js", "js/ascii.js", "img/favicon.svg", "robots.txt", "sitemap.xml"];
    return {
      beforeFiles: [
        { source: "/", destination: "/portfolio/index.html" },
        { source: "/ca", destination: "/portfolio/ca/index.html" },
        ...pages.flatMap((page) => [
          { source: `/${page}`, destination: `/portfolio/${page}.html` },
          { source: `/ca/${page}`, destination: `/portfolio/ca/${page}.html` },
        ]),
        ...assets.map((asset) => ({ source: `/${asset}`, destination: `/portfolio/${asset}` })),
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
