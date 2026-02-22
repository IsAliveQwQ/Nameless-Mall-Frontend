/** @type {import('next').NextConfig} */
const nextConfig = {
  // 核心基礎配置
  output: 'standalone',

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // 圖片優化配置 (關鍵)
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      }
    ],
    // 在開發環境也可以嘗試開啟優化，但若網路環境極差可設為 true
    unoptimized: false,
  },

  // 本地開發環境的 CORS 代理與路徑轉發
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      const apiBaseUrl = process.env.NEXT_PUBLIC_USE_REAL_API === "true"
        ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://isaliveqwq.me')
        : 'http://localhost:8080'

      return [
        {
          source: '/api/:path*',
          destination: `${apiBaseUrl}/api/:path*`,
        },
        {
          source: '/oauth2/:path*',
          destination: `${apiBaseUrl}/oauth2/:path*`,
        },
      ]
    }
    return []
  },

  // 開發環境 Header 配置
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
            { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          ],
        },
      ]
    }
    return []
  },
}

export default nextConfig
