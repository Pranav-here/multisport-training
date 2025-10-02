const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL

const remotePatterns = []

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
}

export default nextConfig
