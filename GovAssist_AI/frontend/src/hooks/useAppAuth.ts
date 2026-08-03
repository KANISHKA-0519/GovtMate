"use client";
import { useState, useEffect } from "react";
import { useUser as useClerkUser } from "@clerk/nextjs";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
export const isClerkLive =
  publishableKey.startsWith("pk_") &&
  !publishableKey.includes("ZGVtby") &&
  !publishableKey.includes("dummy") &&
  !publishableKey.includes("your_");

export interface MockUser {
  id: string;
  fullName: string;
  firstName?: string;
  primaryEmailAddress: { emailAddress: string };
  imageUrl?: string;
}

export const DEFAULT_MOCK_USER: MockUser = {
  id: "user_demo_citizen_123",
  fullName: "Rahul Sharma",
  firstName: "Rahul",
  primaryEmailAddress: { emailAddress: "rahul.sharma@example.com" },
};

export function useAppAuth() {
  const clerkAuth = useClerkUser();
  const [mockUser, setMockUser] = useState<MockUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isClerkLive) {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("govassist_mock_user");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setMockUser(parsed);
            localStorage.setItem("govassist_token", parsed.id || DEFAULT_MOCK_USER.id);
          } catch {
            setMockUser(DEFAULT_MOCK_USER);
            localStorage.setItem("govassist_token", DEFAULT_MOCK_USER.id);
          }
        } else {
          setMockUser(DEFAULT_MOCK_USER);
          localStorage.setItem("govassist_token", DEFAULT_MOCK_USER.id);
        }
      }
      setLoaded(true);
    } else if (clerkAuth.isLoaded && clerkAuth.user) {
      if (typeof window !== "undefined") {
        localStorage.setItem("govassist_token", clerkAuth.user.id);
      }
    }
  }, [clerkAuth.isLoaded, clerkAuth.user]);

  if (isClerkLive) {
    return {
      user: clerkAuth.user,
      isLoaded: clerkAuth.isLoaded,
      isSignedIn: clerkAuth.isSignedIn,
    };
  }

  return {
    user: mockUser,
    isLoaded: loaded,
    isSignedIn: !!mockUser,
  };
}
