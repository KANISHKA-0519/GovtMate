"use client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { JSX } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: JSX.Element;
  color: string;
  trend?: { value: number; label: string };
  index?: number;
}

export function StatCard({ title, value, subtitle, icon, color, trend, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -2 }}
    >
      <Card className="card-hover overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
              <motion.p
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1"
              >
                {value}
              </motion.p>
              {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
              {trend && (
                <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", trend.value >= 0 ? "text-green-600" : "text-red-500")}>
                  {trend.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{Math.abs(trend.value)}% {trend.label}</span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "30" }}>
              <div style={{ color }}>{icon}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
