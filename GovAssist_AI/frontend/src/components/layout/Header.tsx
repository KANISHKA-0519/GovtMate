"use client";
import { useTheme } from "next-themes";
import { UserButton } from "@clerk/nextjs";
import { Bell, Sun, Moon, Search } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import Link from "next/link";
import { motion } from "framer-motion";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { unreadCount } = useAppStore();

  return (
    <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-[#E5E7EB] dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 border border-[#E5E7EB] dark:border-gray-700">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            placeholder="Search..."
            className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 outline-none w-40"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <Link href="/notifications" className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </Link>

        {/* User */}
        <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 rounded-xl" } }} />
      </div>
    </header>
  );
}
