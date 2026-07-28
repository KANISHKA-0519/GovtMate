"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { adminService } from "@/services/api";
import { formatDate } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight, Eye, Users } from "lucide-react";
import Link from "next/link";

export default function AdminCitizensPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-citizens", page, search],
    queryFn: () => adminService.getCitizens(page, 20, search),
  });

  const citizens = (data?.data as Record<string, unknown>[] | undefined) || [];
  const total = (data as Record<string, unknown> | undefined)?.total as number || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout title="Citizen Management" subtitle={`${total} registered citizens`}>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-[#8EC5FC]" /> All Citizens</CardTitle>
            <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name or email..."
                  className="pl-9 pr-4 py-2 text-sm rounded-xl border border-[#E5E7EB] dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#8EC5FC] w-64"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC] text-gray-800 rounded-xl text-sm font-medium">Search</button>
            </form>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] dark:border-gray-700">
                  {["Name", "Email", "Phone", "District", "State", "Registered", "Applications", "Status", "Action"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] dark:divide-gray-700">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : citizens.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">No citizens found</td>
                  </tr>
                ) : citizens.map((c, i) => (
                  <motion.tr
                    key={String(c.id || c.clerkId)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{String(c.name || c.fullName || "—")}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{String(c.email || "—")}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{String(c.phone || "—")}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{String(c.district || "—")}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{String(c.state || "—")}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(String(c.createdAt || new Date()))}</td>
                    <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-gray-100">{String(c.totalApplications || 0)}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.profileCompleted ? "verified" : "pending"} /></td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/citizens/${c.clerkId || c.id}`} className="flex items-center gap-1 text-xs text-[#8EC5FC] hover:text-blue-600 font-medium">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB] dark:border-gray-700">
              <p className="text-xs text-gray-500">Page {page} of {totalPages} ({total} total)</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
