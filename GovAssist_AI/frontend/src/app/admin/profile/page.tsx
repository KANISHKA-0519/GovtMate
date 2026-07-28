"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { clearAdminToken } from "@/lib/api";
import { Shield, User, Mail, Phone, Building, LogOut, Key } from "lucide-react";

export default function AdminProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [adminData, setAdminData] = useState<Record<string, string>>({});
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("admin_data") || "{}");
      setAdminData(data);
    } catch {}
  }, []);

  const handleLogout = () => {
    clearAdminToken();
    localStorage.removeItem("admin_data");
    router.push("/admin/login");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPwd || !newPwd) return;
    toast({ title: "Password change requires backend integration", type: "info" });
    setCurrentPwd("");
    setNewPwd("");
  };

  return (
    <AdminLayout title="Admin Profile" subtitle="Manage your admin account">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8EC5FC] to-[#E0C3FC] flex items-center justify-center">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{adminData.name || "Admin User"}</h2>
                  <p className="text-gray-500">{adminData.email || "admin@govassist.ai"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-[#D6EEFF] text-blue-700 rounded-full px-2.5 py-0.5 font-medium">Admin</span>
                    <span className="text-xs bg-[#DFF6E3] text-green-700 rounded-full px-2.5 py-0.5 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: User, label: "Full Name", value: adminData.name || "Admin User" },
                { icon: Mail, label: "Email", value: adminData.email || "admin@govassist.ai" },
                { icon: Phone, label: "Phone", value: adminData.phone || "+91-9999999999" },
                { icon: Building, label: "Department", value: adminData.department || "IT Department" },
                { icon: Shield, label: "Role", value: adminData.role || "admin" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 py-2 border-b border-[#E5E7EB] dark:border-gray-700 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-[#D6EEFF] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Key className="w-5 h-5 text-[#8EC5FC]" /> Change Password</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <Input label="Current Password" type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} placeholder="••••••••" />
                <Input label="New Password" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="••••••••" />
                <Button type="submit">Update Password</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Logout */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Button variant="outline" className="w-full text-red-500 hover:text-red-600 hover:border-red-300" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Sign Out of Admin Portal
          </Button>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
