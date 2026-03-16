// next.config.ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    serverExternalPackages: ["@prisma/client"],
}

export default nextConfig