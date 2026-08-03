"use client";
import { useState, useEffect } from "react";
import { useAppAuth as useUser } from "@/hooks/useAppAuth";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { userService } from "@/services/api";
import { User, Phone, MapPin, Calendar, CreditCard, Building, Briefcase, GraduationCap, Heart, AlertCircle } from "lucide-react";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userService.getProfile(),
    enabled: !!user,
  });

  const profile = profileData?.data as Record<string, unknown> | undefined;

  useEffect(() => {
    if (profile && !profile.profileCompleted) {
      setIsFirstLogin(true);
    }
  }, [profile]);

  const [form, setForm] = useState({
    fullName: "", phone: "", gender: "", dateOfBirth: "", aadhaar: "",
    address: "", district: "", state: "", pincode: "", occupation: "",
    annualIncome: "", community: "", education: "", emergencyContact: "",
    category: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: String(profile.fullName || profile.name || user?.fullName || ""),
        phone: String(profile.phone || ""),
        gender: String(profile.gender || ""),
        dateOfBirth: String(profile.dateOfBirth || ""),
        aadhaar: String(profile.aadhaar || ""),
        address: String(profile.address || ""),
        district: String(profile.district || ""),
        state: String(profile.state || ""),
        pincode: String(profile.pincode || ""),
        occupation: String(profile.occupation || ""),
        annualIncome: String(profile.annualIncome || ""),
        community: String(profile.community || ""),
        education: String(profile.education || ""),
        emergencyContact: String(profile.emergencyContact || ""),
        category: String(profile.category || ""),
      });
    }
  }, [profile, user]);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => userService.update(data),
    onSuccess: () => {
      toast({ title: "Profile saved successfully!", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      if (isFirstLogin) {
        router.push("/dashboard");
      }
    },
    onError: () => toast({ title: "Failed to save profile", type: "error" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone || !form.fullName) {
      toast({ title: "Name and phone are required", type: "warning" });
      return;
    }
    mutation.mutate({
      ...form,
      annualIncome: form.annualIncome ? parseFloat(form.annualIncome) : undefined,
      profileCompleted: true,
    });
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  if (isLoading) return (
    <DashboardLayout title="Profile" subtitle="Loading..." skipProfileGuard>
      <div className="max-w-3xl mx-auto space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Profile" subtitle={isFirstLogin ? "Complete your profile to continue" : "Manage your personal information"} skipProfileGuard>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* First login banner */}
        {isFirstLogin && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-[#D6EEFF] border border-[#8EC5FC]/40 rounded-2xl p-4">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800 font-medium">
              Welcome! Please complete your profile before accessing the dashboard.
            </p>
          </motion.div>
        )}

        {/* Avatar Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-[#8EC5FC] to-[#E0C3FC] flex items-center justify-center">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{form.fullName || user?.fullName || "Citizen"}</h2>
                  <p className="text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {profile?.profileCompleted
                      ? <span className="text-xs bg-[#DFF6E3] text-green-700 rounded-full px-2.5 py-0.5 font-medium">Profile Complete</span>
                      : <span className="text-xs bg-[#FFF4CC] text-yellow-700 rounded-full px-2.5 py-0.5 font-medium">Profile Incomplete</span>
                    }
                    <span className="text-xs bg-[#D6EEFF] text-blue-700 rounded-full px-2.5 py-0.5 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <Card className="mb-4">
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-[#8EC5FC]" /> Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full Name *" placeholder="Your full name" value={form.fullName} onChange={set("fullName")} icon={<User className="w-4 h-4" />} />
                  <Input label="Phone Number *" placeholder="10-digit mobile" value={form.phone} onChange={set("phone")} icon={<Phone className="w-4 h-4" />} />
                  <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} icon={<Calendar className="w-4 h-4" />} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gender</label>
                    <select suppressHydrationWarning value={form.gender} onChange={set("gender")} className="w-full h-10 rounded-xl border border-[#E5E7EB] dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#8EC5FC]">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <Input label="Aadhaar Number" placeholder="12-digit Aadhaar" value={form.aadhaar} onChange={set("aadhaar")} icon={<CreditCard className="w-4 h-4" />} />
                  <Input label="Emergency Contact" placeholder="Emergency phone number" value={form.emergencyContact} onChange={set("emergencyContact")} icon={<Heart className="w-4 h-4" />} />
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="mb-4">
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-[#B5EAD7]" /> Address Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Address</label>
                  <textarea value={form.address} onChange={set("address")} placeholder="House no, Street, City" rows={2}
                    className="w-full rounded-xl border border-[#E5E7EB] dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#8EC5FC] resize-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="District" placeholder="Your district" value={form.district} onChange={set("district")} icon={<Building className="w-4 h-4" />} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">State</label>
                    <select suppressHydrationWarning value={form.state} onChange={set("state")} className="w-full h-10 rounded-xl border border-[#E5E7EB] dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#8EC5FC]">
                      <option value="">Select state</option>
                      {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <Input label="Pincode" placeholder="6-digit PIN" value={form.pincode} onChange={set("pincode")} icon={<MapPin className="w-4 h-4" />} />
                </div>
              </CardContent>
            </Card>

            {/* Social & Economic */}
            <Card className="mb-6">
              <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-[#E0C3FC]" /> Social & Economic Details</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                    <select suppressHydrationWarning value={form.category} onChange={set("category")} className="w-full h-10 rounded-xl border border-[#E5E7EB] dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#8EC5FC]">
                      <option value="">Select category</option>
                      <option value="general">General</option>
                      <option value="obc">OBC</option>
                      <option value="sc">SC</option>
                      <option value="st">ST</option>
                    </select>
                  </div>
                  <Input label="Community" placeholder="e.g. Hindu, Muslim, Christian" value={form.community} onChange={set("community")} />
                  <Input label="Annual Income (₹)" placeholder="e.g. 250000" type="number" value={form.annualIncome} onChange={set("annualIncome")} />
                  <Input label="Occupation" placeholder="e.g. Farmer, Teacher" value={form.occupation} onChange={set("occupation")} icon={<Briefcase className="w-4 h-4" />} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Education</label>
                    <select suppressHydrationWarning value={form.education} onChange={set("education")} className="w-full h-10 rounded-xl border border-[#E5E7EB] dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#8EC5FC]">
                      <option value="">Select education</option>
                      <option value="no_formal">No Formal Education</option>
                      <option value="primary">Primary School</option>
                      <option value="secondary">Secondary School</option>
                      <option value="higher_secondary">Higher Secondary</option>
                      <option value="graduate">Graduate</option>
                      <option value="post_graduate">Post Graduate</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              {!isFirstLogin && (
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>Cancel</Button>
              )}
              <Button type="submit" loading={mutation.isPending}>
                {isFirstLogin ? "Complete Profile & Continue" : "Save Changes"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
