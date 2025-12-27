/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Critical for GitHub Pages
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'github.com', pathname: '**' },
      { protocol: 'https', hostname: 'objects.githubusercontent.com', pathname: '**' }
    ],
  },
};

module.exports = nextConfig;