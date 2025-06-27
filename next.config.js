/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'flagsapi.com'],
    unoptimized: true,
  },
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['@heroicons/react', '@headlessui/react']
  },
  productionBrowserSourceMaps: false,
  swcMinify: true,
}

module.exports = nextConfig 