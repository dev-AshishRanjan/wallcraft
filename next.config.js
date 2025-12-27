/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const repoName = "wallcraft";

const nextConfig = {
  output: "export",
  // basePath tells Next.js we are hosted in a subfolder
  basePath: isProd ? `/${repoName}` : "",
  // assetPrefix ensures CSS/JS chunks load from that subfolder
  assetPrefix: isProd ? `/${repoName}/` : "",
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "github.com", pathname: "**" },
      {
        protocol: "https",
        hostname: "objects.githubusercontent.com",
        pathname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
