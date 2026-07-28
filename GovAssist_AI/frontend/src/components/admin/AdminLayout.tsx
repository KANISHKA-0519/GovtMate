"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { clearAdminToken } from "@/lib/api";
import {
  LayoutDashboard, Users, FileText, BarChart3, Bell, User,
  Shield, ChevronLeft, ChevronRight, LogOut, Sparkles
} from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/citizens", label: "Citizens", icon: Users },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/profile", label: "Profile", icon: User },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [adminData, setAdminData] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    try {
      const data = JSON.parse(localStorage.getItem("admin_data") || "{}");
      setAdminData(data);
    } catch {}
  }, [router]);

  const handleLogout = () => {
    clearAdminToken();
    localStorage.removeItem("admin_data");
    router.push("/admin/login");
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-full bg-[#1e293b] z-40 flex flex-col overflow-hidden"
      >
        <div className="flex items-center gap-3 p-4 h-16 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8EC5FC] to-[#E0C3FC] flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-bold text-white text-sm leading-tight">Admin Portal</p>
                <p className="text-xs text-slate-400">GovAssist AI</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminNav.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  active
                    ? "bg-gradient-to-r from-[#8EC5FC]/20 to-[#E0C3FC]/20 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          {!collapsed && (
            <div className="px-3 py-2 mb-1">
              <p className="text-xs font-medium text-white truncate">{adminData.name || "Admin"}</p>
              <p className="text-xs text-slate-400 truncate">{adminData.email || ""}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:bg-white/5 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <motion.div
        animate={{ marginLeft: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-1 flex flex-col min-h-screen"
      >
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-[#E5E7EB] dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#8EC5FC]" />
              {title}
            </h1>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#D6EEFF] text-blue-700 rounded-full px-3 py-1 font-medium">
              Admin
            </span>
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 ml-2">← Citizen Portal</Link>
          </div>
        </header>
        <main className="flex-1 p-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}
