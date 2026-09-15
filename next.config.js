const nextConfig = {
  async redirects() {
    return [
      { source: '/nilsson', destination: '/celebrate-nilsson', permanent: true },
      { source: '/salon-concerts', destination: '/', permanent: true },
      { source: '/experience/:slug*', destination: '/', permanent: true },
      { source: '/experiences', destination: '/', permanent: true },
      { source: '/book', destination: '/', permanent: true },
      { source: '/booking/:slug*', destination: '/', permanent: true },
    ];
  },
};

module.exports = nextConfig;
