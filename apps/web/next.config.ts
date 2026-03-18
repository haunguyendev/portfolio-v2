import type { NextConfig } from 'next'

// Initialize Velite content build for dev/build modes
const isDev = process.argv.indexOf('dev') !== -1
const isBuild = process.argv.indexOf('build') !== -1

if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = '1'
  import('velite')
    .then((m) => m.build({ watch: isDev, clean: !isDev }))
    .catch((e) => console.error('Velite build failed:', e))
}

// Internal API URL for server-side proxying (Docker: http://api:3001, local: http://localhost:3001)
const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? 'http://localhost:3001'

const nextConfig: NextConfig = {
  // standalone mode: output minimal server cho Docker (không cần node_modules)
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75],
  },
  // Proxy /api/media/* to backend API — avoids Next.js private IP blocking for images
  async rewrites() {
    return [
      { source: '/api/media/:path*', destination: `${INTERNAL_API_URL}/api/media/:path*` },
    ]
  },
}

export default nextConfig
