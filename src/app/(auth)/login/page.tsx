import { signIn } from "@/lib/auth";
import { Github } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-4 sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center">
            <Image
              src="/icon-192.png"
              alt="GitDrive"
              width={192}
              height={192}
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl"
              priority
            />
          </div>
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-foreground">GitDrive</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cloud storage powered by GitHub repositories
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/drive" });
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-200"
          >
            <Github className="h-5 w-5" />
            Sign in with GitHub
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          We need access to your repositories to manage files.
          <br />
          Your data stays in your GitHub account.
        </p>
      </div>
    </div>
  );
}
