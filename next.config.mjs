import withPWAInit from '@ducanh2912/next-pwa';

/** @type {import('next').NextConfig} */

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  output: 'export',
  basePath: '/LexiLearn09672',
  assetPrefix: '/LexiLearn09672/',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default withPWA(nextConfig);
