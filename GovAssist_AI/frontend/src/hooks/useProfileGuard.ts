"use client";
import { useEffect, useMemo, useState } from "react";
import { useAppAuth } from "@/hooks/useAppAuth";
import { useRouter, usePathname } from "next/navigation";
import { setAuthToken } from "@/lib/api";
import { userService } from "@/services/api";

export function useProfileGuard(options?: { skip?: boolean }) {
  const { user, isLoaded } = useAppAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [profileChecked, setProfileChecked] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState<boolean | null>(null);

  const shouldCheck = !options?.skip && isLoaded && !!user;

  useEffect(() => {
    if (!shouldCheck) return;

    let cancelled = false;
    setAuthToken(user!.id);

    const checkProfile = async () => {
      try {
        let userData: Record<string, unknown> | undefined;
        try {
          const res = await userService.sync({
            clerkId: user!.id,
            name: user!.fullName,
            email: user!.primaryEmailAddress?.emailAddress,
          });
          userData = res?.data as Record<string, unknown> | undefined;
        } catch {
          const res = await userService.getProfile();
          userData = res?.data as Record<string, unknown> | undefined;
        }

        if (cancelled) return;

        const completed = userData?.profileCompleted !== undefined ? !!userData.profileCompleted : true;
        setProfileCompleted(completed);
      } catch {
        if (!cancelled) setProfileCompleted(true);
      } finally {
        if (!cancelled) setProfileChecked(true);
      }
    };

    checkProfile();
    return () => {
      cancelled = true;
    };
  }, [shouldCheck, user, pathname, router]);

  const checking = useMemo(() => shouldCheck && !profileChecked, [shouldCheck, profileChecked]);

  return { checking, profileCompleted };
}
