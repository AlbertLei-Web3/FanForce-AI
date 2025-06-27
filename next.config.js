/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'flagsapi.com'],
    unoptimized: true,
  },
  output: 'standalone',
  telemetry: {
    disabled: true
  },
  experimental: {
    optimizePackageImports: ['@heroicons/react', '@headlessui/react']
  }
}

module.exports = nextConfig 