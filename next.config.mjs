/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: '/LexiLearn09672',
  assetPrefix: '/LexiLearn09672/',
};

export default nextConfig;
