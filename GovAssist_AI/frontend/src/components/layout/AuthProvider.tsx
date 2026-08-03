"use client";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { isClerkLive } from "@/hooks/useAppAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (isClerkLive) {
    return <ClerkProvider>{children}</ClerkProvider>;
  }
  return <>{children}</>;
}
