import {
  cacheFirst,
  staleWhileRevalidate
} from 'workbox-recipes';
import {
  precacheAndRoute
} from 'workbox-precaching';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
};

// PWA configuration
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/app-build-manifest.json$/],
  cacheStartUrl: true,
  runtimeCaching: [{
      urlPattern: ({
        request,
        url
      }) =>
      request.destination === "document" ||
      request.destination === "script" ||
      request.destination === "style",
      handler: staleWhileRevalidate({
        cacheName: "pages-cache",
        plugins: [{
          // This plugin will cache responses with a 200 status code.
          cacheableResponse: {
            statuses: [200],
          },
        }, ],
      }),
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
      handler: cacheFirst({
        cacheName: 'image-cache',
        plugins: [{
          // This plugin will cache responses with a 200 status code.
          cacheableResponse: {
            statuses: [200],
          },
        }, ],
      }),
    },
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
      handler: staleWhileRevalidate({
        cacheName: 'google-fonts-cache',
      }),
    }
  ],
  fallbacks: {
    document: '/_offline',
  }
});


export default withPWA(nextConfig);