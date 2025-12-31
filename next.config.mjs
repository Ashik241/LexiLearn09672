/** @type {import('next').NextConfig} */

import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // Set the basePath for GitHub Pages deployment.
  basePath: '/LexiLearn09672',
  // Set the assetPrefix for correct asset loading.
  assetPrefix: '/LexiLearn09672/',
  images: {
    // Disable image optimization for static export.
    unoptimized: true,
  },
};

export default withPWA(nextConfig);
