import { NextResponse } from "next/server";

export async function GET() {
  // Show ALL env var keys to see what exists
  const allKeys = Object.keys(process.env).sort();

  // Directly check the expected vars
  const check = {
    AUTH_SECRET: process.env.AUTH_SECRET ? "SET" : "MISSING",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "MISSING",
    GITHUB_ID: process.env.GITHUB_ID ? "SET" : "MISSING",
    GITHUB_SECRET: process.env.GITHUB_SECRET ? "SET" : "MISSING",
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID ? "SET" : "MISSING",
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET ? "SET" : "MISSING",
  };

  return NextResponse.json({
    check,
    totalEnvVars: allKeys.length,
    allKeys,
    vercelProject: process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "unknown",
    vercelEnv: process.env.VERCEL_ENV ?? "unknown",
  });
}
