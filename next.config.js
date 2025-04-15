/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    unoptimized: true,
  },
  devIndicators: {
    buildActivity: false
  },
  trailingSlash: true,
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (isServer) {
      require('./scripts/sitemap-generator')
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }
    return config
  },
}

// Conditionally set the output and routing based on the environment
if (process.env.NEXT_PUBLIC_SEO === "false") {
  nextConfig.output = 'export'
  nextConfig.images.unoptimized = true
} else {
  nextConfig.rewrites = async () => {
    return [
      {
        source: '/properties/categories/:slug',
        destination: '/properties/categories/[slug]',
      },
      {
        source: '/properties-details/:slug',
        destination: '/properties-details/[slug]',
      },
    ]
  }
}

module.exports = nextConfig
