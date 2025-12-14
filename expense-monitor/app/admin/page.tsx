import { getServerSession } from "next-auth/next";
import authOptions from "@/libs/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions as any);
  if (!session || !(session as any).user) {
    // Not signed in
    redirect("/login");
  }
  if ((session as any).user.role !== "admin") {
    redirect("/unauthorized");
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-4">Protected admin area — only visible to users with role "admin".</p>
    </main>
  );
}
