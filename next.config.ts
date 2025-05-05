const nextConfig = {
  images: {
    domains: ["localhost","192.168.23.62"],
  },
  webpack: (config: any) => {
    config.infrastructureLogging = {
      level: "error",
    };
    return config;
  },
};

export default nextConfig;