"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, User, LogOut, Settings, Shield } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
];

const authNavLinks = [
  { label: "Dashboard", href: "/dashboard" },
];

const adminNavLinks = [
  { label: "Admin", href: "/admin" },
];

export function Navbar() {
  const { user, isAdmin, loading } = useUser();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allLinks = [
    ...navLinks,
    ...(user ? authNavLinks : []),
    ...(isAdmin ? adminNavLinks : []),
  ];

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-white/10 bg-white/70 backdrop-blur-xl dark:bg-gray-950/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <span className="text-sm font-bold text-white">W</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            WorkBuddy
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth area */}
        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="rounded-full transition-opacity hover:opacity-80"
              >
                <Avatar
                  src={user.avatar_url}
                  fallback={user.full_name || user.email}
                  size="md"
                />
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
                  >
                    <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.full_name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Shield className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        href="/auth/logout"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait">
            {mobileOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6 text-gray-900 dark:text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-6 w-6 text-gray-900 dark:text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed top-0 right-0 z-40 h-full w-72 border-l border-white/10 bg-white/95 backdrop-blur-xl dark:bg-gray-950/95 md:hidden"
            >
              <div className="flex flex-col gap-1 px-4 pt-20">
                {allLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-4 border-t border-gray-200 dark:border-gray-800" />
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar
                        src={user.avatar_url}
                        fallback={user.full_name || user.email}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {user.full_name || "User"}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/auth/logout"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Link>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-3">
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      className={cn(buttonVariants({ variant: "outline" }))}
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileOpen(false)}
                      className={cn(buttonVariants())}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
