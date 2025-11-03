import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectMongo } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/db/models";
import { AuthCredentialsSchema } from "@/lib/zod-schemas";

const providers = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      const parsed = AuthCredentialsSchema.safeParse(credentials);
      if (!parsed.success) return null;

      await connectMongo();
      const user = await UserModel.findOne({ email: parsed.data.email });
      if (!user) return null;

      const isValid = await bcrypt.compare(parsed.data.password, user.password);
      if (!isValid) return null;

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name ?? user.email.split("@")[0],
        image: user.image ?? undefined
      };
    }
  })
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  );
}

export const authOptions: AuthOptions = {
  providers,
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub ?? "";
      }
      return session;
    }
  }
};
