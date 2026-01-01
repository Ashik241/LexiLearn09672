/** @type {import('next').NextConfig} */
import nextPwa from 'next-pwa';

const withPWA = nextPwa({
  dest: 'public',
  register: false, // Set to false to manually register the service worker in PwaProvider
  skipWaiting: false, // Set to false to show a "new version available" prompt
});

const nextConfig = {
    // any other next.js config options
};

export default withPWA(nextConfig);
