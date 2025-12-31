/** @type {import('next').NextConfig} */

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});


const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/LexiLearn09672',
  assetPrefix: '/LexiLearn09672/',
  images: {
    unoptimized: true,
  },
};

export default withPWA(nextConfig);
