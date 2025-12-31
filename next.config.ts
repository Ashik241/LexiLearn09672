import type {NextConfig} from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const REPO_NAME = 'LexiLearn09672';
const isProd = process.env.NODE_ENV === 'production';

const withPWA = withPWAInit({
  dest: 'public',
  disable: !isProd,
});

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: isProd ? `/${REPO_NAME}` : '',
  assetPrefix: isProd ? `/${REPO_NAME}/` : '',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // This is crucial for handling dynamic routes with `output: 'export'`.
  // It tells Next.js to show a 404 page for paths not generated at build time.
  // Since we handle rendering on the client side, this prevents build errors.
  dynamicParams: false,
};

module.exports = withPWA(nextConfig);
