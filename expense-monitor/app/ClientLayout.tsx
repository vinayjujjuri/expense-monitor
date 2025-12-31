"use client";
import Navbar from "@/components/navbar";
import AuthProvider from "@/components/AuthProvider";
import AuthGate from "@/components/AuthGate";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}