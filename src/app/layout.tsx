import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1d1d20",
};

export const metadata: Metadata = {
  title: "GitDrive - Cloud Storage powered by GitHub",
  description: "Manage your files using GitHub repositories as storage backend",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GitDrive",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <SessionProvider>
          <QueryProvider>
            {children}
            <Toaster theme="dark" position="bottom-right" />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
