import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User";
import { connectDB } from "@/libs/db";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials) return null;
        await connectDB();
        const { email, password } = credentials as { email: string; password: string };
        const user = await User.findOne({ email }).exec();
        if (!user) return null;
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;
        return { id: user._id.toString(), email: user.email, role: user.role } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id ?? user._id;
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user = { email: token.email, role: token.role } as any;
      (session.user as any).id = token.id;
      return session;
    },
  },
};

export default authOptions;
