/** @type {import('next').NextConfig} */

module.exports = {
  webpack: (config) => {
    config.resolve.alias['hls.js'] = 'hls.js/dist/hls.min.js';
    config.externals = [...(config.externals || []), { canvas: 'canvas' }]
    return config;
  },
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
}