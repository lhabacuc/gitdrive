import { NextResponse } from "next/server";

export async function GET() {
  const authKeys = Object.keys(process.env).filter((k) =>
    /secret|auth|github|nextauth/i.test(k)
  );

  const masked: Record<string, string> = {};
  for (const key of authKeys) {
    const val = process.env[key] ?? "";
    masked[key] = val ? `${val.slice(0, 4)}...${val.slice(-4)} (len=${val.length})` : "(empty)";
  }

  return NextResponse.json({
    keys: authKeys,
    values: masked,
    nodeEnv: process.env.NODE_ENV,
  });
}
