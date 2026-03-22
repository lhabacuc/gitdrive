import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LandingPage } from "@/components/landing-page";

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect("/drive");
  }
  return <LandingPage />;
}
