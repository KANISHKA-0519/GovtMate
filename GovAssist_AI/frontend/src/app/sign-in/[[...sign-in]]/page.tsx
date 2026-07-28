"use client";
import { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, User, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { adminService } from "@/services/api";
import { setAdminToken } from "@/lib/api";

export default function SignInPage() {
  const router = useRouter();
  const [role, setRole] = useState<"citizen" | "admin">("citizen");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminService.login(email, password);
      if (res.success && res.data?.token) {
        const token = res.data.token as string;
        setAdminToken(token);
        localStorage.setItem("admin_data", JSON.stringify(res.data.admin));
        router.push("/admin");
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8EC5FC] to-[#E0C3FC] flex items-center justify-center">
              <span className="text-white text-lg">✦</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">GovAssist AI</span>
          </div>
          <p className="text-gray-500 text-sm">Sign in to access your government services</p>
        </div>

        <div className="rounded-2xl shadow-sm border border-[#E5E7EB] bg-white dark:bg-gray-900 dark:border-gray-700 mb-4">
          <div className="flex p-1.5 gap-1.5">
            <button
              onClick={() => setRole("citizen")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                role === "citizen"
                  ? "bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC] text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <User className="w-4 h-4" />
              Citizen
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                role === "admin"
                  ? "bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC] text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Shield className="w-4 h-4" />
              Administrator
            </button>
          </div>
        </div>

        {role === "citizen" ? (
          <motion.div
            key="citizen"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "rounded-2xl shadow-sm border border-[#E5E7EB] bg-white dark:bg-gray-900 dark:border-gray-700",
                  headerTitle: "text-gray-900 dark:text-gray-100 font-semibold",
                  headerSubtitle: "text-gray-500 dark:text-gray-400",
                  formButtonPrimary: "bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC] text-gray-800 hover:opacity-90 rounded-xl",
                  formFieldInput:
                    "rounded-xl border-[#E5E7EB] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:ring-[#8EC5FC]",
                  footerActionLink: "text-blue-600 hover:text-blue-700",
                },
              }}
            />
          </motion.div>
        ) : (
          <motion.form
            key="admin"
            onSubmit={handleAdminLogin}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl shadow-sm border border-[#E5E7EB] bg-white dark:bg-gray-900 dark:border-gray-700 p-6 space-y-5"
          >
            <div className="text-center pb-1">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8EC5FC] to-[#E0C3FC] mb-3">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Administrator Sign In</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">GovAssist AI — Restricted Access</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@govassist.ai"
                required
                className="w-full rounded-xl border border-[#E5E7EB] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#8EC5FC]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-[#E5E7EB] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#8EC5FC]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC] text-gray-800 font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {loading ? "Signing in..." : "Sign In to Admin Portal"}
            </button>

            <div className="pt-3 border-t border-[#E5E7EB] dark:border-gray-700 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Admin credentials are configured via the backend .env file (DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD).
              </p>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
}
