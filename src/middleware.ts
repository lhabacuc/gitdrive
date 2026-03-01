export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/drive/:path*", "/preview/:path*"],
};
