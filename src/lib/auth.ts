import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const secret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  process.env.SECRET;

if (!secret) {
  console.error(
    "[auth] No secret found. Available env keys:",
    Object.keys(process.env).filter((k) =>
      /secret|auth/i.test(k)
    )
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret,
  trustHost: true,
  providers: [
    GitHub({
      clientId:
        process.env.AUTH_GITHUB_ID ??
        process.env.GITHUB_ID ??
        "",
      clientSecret:
        process.env.AUTH_GITHUB_SECRET ??
        process.env.GITHUB_SECRET ??
        "",
      authorization: {
        params: {
          scope: "repo read:user user:email",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.login = (profile as { login?: string }).login;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.login = token.login as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
