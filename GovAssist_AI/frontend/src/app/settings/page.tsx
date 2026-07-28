"use client";
import { useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor, Bell, Shield, Globe, Trash2, Download } from "lucide-react";

interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}

function Toggle({ enabled, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC]" : "bg-gray-200 dark:bg-gray-700"}`}
      >
        <motion.div
          animate={{ x: enabled ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true, sms: false, push: true, updates: true, reminders: true,
  });
  const [privacy, setPrivacy] = useState({
    shareData: false, analytics: true, twoFactor: false,
  });

  const themes = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account preferences">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Theme */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sun className="w-5 h-5 text-[#FBBF24]" /> Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {themes.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTheme(id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      theme === id ? "border-[#8EC5FC] bg-[#D6EEFF]/30" : "border-[#E5E7EB] dark:border-gray-700 hover:border-[#8EC5FC]/50"
                    }`}
                  >
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-[#8EC5FC]" /> Notifications</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-[#E5E7EB] dark:divide-gray-700">
              <Toggle enabled={notifications.email} onChange={(v) => setNotifications((p) => ({ ...p, email: v }))} label="Email Notifications" description="Receive updates via email" />
              <Toggle enabled={notifications.sms} onChange={(v) => setNotifications((p) => ({ ...p, sms: v }))} label="SMS Notifications" description="Receive SMS alerts" />
              <Toggle enabled={notifications.push} onChange={(v) => setNotifications((p) => ({ ...p, push: v }))} label="Push Notifications" description="Browser push notifications" />
              <Toggle enabled={notifications.updates} onChange={(v) => setNotifications((p) => ({ ...p, updates: v }))} label="Application Updates" description="Status change notifications" />
              <Toggle enabled={notifications.reminders} onChange={(v) => setNotifications((p) => ({ ...p, reminders: v }))} label="Document Reminders" description="Reminders for missing documents" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-[#B5EAD7]" /> Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-[#E5E7EB] dark:divide-gray-700">
              <Toggle enabled={privacy.twoFactor} onChange={(v) => setPrivacy((p) => ({ ...p, twoFactor: v }))} label="Two-Factor Authentication" description="Add extra security to your account" />
              <Toggle enabled={privacy.analytics} onChange={(v) => setPrivacy((p) => ({ ...p, analytics: v }))} label="Usage Analytics" description="Help improve the platform" />
              <Toggle enabled={privacy.shareData} onChange={(v) => setPrivacy((p) => ({ ...p, shareData: v }))} label="Data Sharing" description="Share anonymized data with departments" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Data */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-[#E0C3FC]" /> Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Download className="w-4 h-4" /> Export My Data
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:border-red-300">
                <Trash2 className="w-4 h-4" /> Delete Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
