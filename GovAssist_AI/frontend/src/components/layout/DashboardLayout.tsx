"use client";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAppStore } from "@/store/useAppStore";
import { useProfileGuard } from "@/hooks/useProfileGuard";

import { useState, useEffect } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  isAdmin?: boolean;
  skipProfileGuard?: boolean;
}

export function DashboardLayout({ children, title, subtitle, isAdmin, skipProfileGuard }: DashboardLayoutProps) {
  const { sidebarOpen } = useAppStore();
  const { checking } = useProfileGuard({ skip: skipProfileGuard || isAdmin });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isOpen = mounted ? sidebarOpen : true;

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#8EC5FC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950">
      <Sidebar isAdmin={isAdmin} />
      <motion.div
        animate={{ marginLeft: isOpen ? 240 : 72 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen flex flex-col"
      >
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}
