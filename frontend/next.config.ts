import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
  },
  async rewrites() {
    const externalApi = process.env.NEXT_PUBLIC_API_URL;
    if (externalApi && (externalApi.startsWith('http://') || externalApi.startsWith('https://'))) {
      return [
        {
          source: '/api/:path*',
          destination: `${externalApi}/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
