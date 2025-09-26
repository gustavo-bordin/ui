/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  outputFileTracingIncludes: {
    "/*": ["./registry/**/*"],
  },
};

export default nextConfig;
