import { signIn } from "@/lib/auth";
import { Github } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-primary">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="13 2 13 9 20 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-foreground">GitDrive</h1>
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
