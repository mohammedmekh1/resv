/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'drive.google.com'],
  },
  env: {
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID || '1FOp8T6YvD1qg6XXnCg7RJopHG_uOAr8A74q2tFu26HA',
    N8N_BASE_URL: process.env.N8N_BASE_URL || 'https://n8n.srv1332143.hstgr.cloud',
    NEXT_PUBLIC_SHEET_API_KEY: process.env.NEXT_PUBLIC_SHEET_API_KEY || '',
  },
}
module.exports = nextConfig
