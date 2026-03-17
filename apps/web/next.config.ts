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

const nextConfig: NextConfig = {
  // standalone mode: output minimal server cho Docker (không cần node_modules)
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
