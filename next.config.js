const nextConfig = {
  async redirects() {
    return [
      { source: '/nilsson', destination: '/celebrate-nilsson', permanent: true },
      { source: '/salon-concerts', destination: '/', permanent: true },
      { source: '/experience/:slug*', destination: '/', permanent: true },
      { source: '/experiences', destination: '/', permanent: true },
    ];
  },
};

module.exports = nextConfig;
