import withPWAInit from '@ducanh2912/next-pwa';

const REPO_NAME = 'LexiLearn09672';
const isProd = process.env.NODE_ENV === 'production';

const withPWA = withPWAInit({
  dest: 'public',
  disable: !isProd,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default withPWA(nextConfig);
