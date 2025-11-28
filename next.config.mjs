const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL

const remotePatterns = [
  // TheSportsDB API images
  {
    protocol: 'https',
    hostname: 'r2.thesportsdb.com',
    pathname: '/images/**',
  },
]

if (SUPABASE_URL) {
  try {
    const { hostname } = new URL(SUPABASE_URL)
    remotePatterns.push({
      protocol: 'https',
      hostname,
      pathname: '/storage/v1/object/public/*',
    })
  } catch (error) {
    console.warn('[next.config] Invalid SUPABASE_URL for image remotePatterns', error)
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns,
  },
  webpack(config, { isServer }) {
    if (isServer && config.output) {
      const configuredName = config.output.chunkFilename ?? ''
      if (!configuredName?.startsWith('chunks/')) {
        const baseName = configuredName || '[name].js'
        config.output.chunkFilename = baseName.startsWith('chunks/')
          ? baseName
          : `chunks/${baseName}`
      }
    }
    return config
  },
}

export default nextConfig
