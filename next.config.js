/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*', // Redirect all paths
        destination: 'https://nextjs15-bridgeschool.vercel.app/',
        permanent: true
      }
    ]
  }
}

module.exports = nextConfig
