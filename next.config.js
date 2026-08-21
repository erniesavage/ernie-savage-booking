/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/celebrate-nilsson', destination: '/', permanent: true },
      { source: '/nilsson', destination: '/', permanent: true },
      { source: '/salon-concerts', destination: '/', permanent: true },
    ];
  },
};

module.exports = nextConfig;
