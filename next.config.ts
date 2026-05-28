import type { NextConfig } from 'next';

// basePath/assetPrefix only set during the GH Pages build; local `next dev`
// keeps an empty base for normal localhost paths.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const config: NextConfig = {
  output: 'export',
  reactStrictMode: false,
  transpilePackages: ['three'],
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default config;
