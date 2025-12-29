import withPWAInit from "@ducanh2912/next-pwa";

const isProd = process.env.NODE_ENV === "production";
const repoName = "wallcraft";

const withPWA = withPWAInit({
  dest: "public",
  disable: !isProd,
  // Cache strategies
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: false,
  },
  turbopack: {},
  output: "export",
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? `/${repoName}` : "",
  },
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

export default withPWA(nextConfig);
