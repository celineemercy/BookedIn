import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;
const nextConfig: NextConfig = {
  images: { remotePatterns: [...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/business-images/**" }] : []), { protocol: "https", hostname: "images.unsplash.com" }] },
};
export default nextConfig;
