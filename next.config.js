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
  
  // Suppress hydration warnings from browser extensions
  // 抑制来自浏览器扩展的水合警告
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  
  // Suppress hydration warnings
  // 抑制水合警告
  compiler: {
    // Remove console.log in production
    // 在生产环境中移除console.log
    removeConsole: process.env.NODE_ENV === "production",
  },
}

module.exports = nextConfig 