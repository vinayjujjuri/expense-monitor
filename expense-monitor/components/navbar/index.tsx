"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      role?: string | null;
    } & DefaultSession["user"];
  }
}

const menu = [
  { label: "New User", href: "/user-register", public: true },
  { label: "Add Credit", href: "/add-credit" },
  { label: "Add Debit", href: "/add-debit" },
  { label: "Weekly Report", href: "/weekly-report" },
  { label: "Yearly Report", href: "/yearly-analytics" },
  { label: "Admin", href: "/admin/users", admin: true },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const filteredMenu = !session?.user
    ? menu.filter((item) => item.public)
    : menu.filter((item) => {
        if (item.public) return false;
        if (!item.admin) return true;
        return session.user?.role === "admin";
      });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/icon_exp_trac.png"
              alt="Expense Monitor"
              width={36}
              height={36}
              className="rounded"
            />
            <span className="text-lg font-semibold text-gray-800">
              Expense Monitor
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-1">
            {filteredMenu.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition
                    ${
                      isActive
                        ? "bg-teal-50 text-teal-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                    ${
                      item.admin
                        ? "ml-2 border border-violet-200 text-teal-600 hover:bg-violet-50"
                        : ""
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}

            {session?.user && (
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="ml-4 rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition"
              >
                Logout
              </button>
            )}
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden rounded-md p-2 text-teal-600 hover:bg-teal-100"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur">
          <div className="space-y-1 px-4 py-3">
            {filteredMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition
                  ${
                    pathname === item.href
                      ? "bg-teal-50 text-teal-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                  ${
                    item.admin
                      ? "border border-violet-200 text-teal-600 hover:bg-violet-50"
                      : ""
                  }
                `}
              >
                {item.label}
              </Link>
            ))}

            {session?.user && (
              <button
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
                className="mt-2 w-full rounded-md bg-red-100 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
