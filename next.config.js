/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // WebContainer 需要在同源环境下运行
  // 部署到 Vercel 时自动支持，静态导出（next export）时需要特殊处理
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // WebContainer 只能在浏览器端运行
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
