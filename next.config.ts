import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    // Keep the portfolio's document transitions independent of the dashboard's
    // React layout. The existing API and dashboard routes continue through Next.
    const pages = ["index", "projects", "about", "contact"];
    const assets = ["css/site.css", "js/site.js", "js/ascii.js", "img/favicon.svg", "robots.txt", "sitemap.xml"];
    return {
      beforeFiles: [
        { source: "/", destination: "/portfolio/index.html" },
        { source: "/ca", destination: "/portfolio/ca/index.html" },
        ...pages.flatMap((page) => [
          { source: `/${page}.html`, destination: `/portfolio/${page}.html` },
          { source: `/ca/${page}.html`, destination: `/portfolio/ca/${page}.html` },
        ]),
        ...assets.map((asset) => ({ source: `/${asset}`, destination: `/portfolio/${asset}` })),
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
