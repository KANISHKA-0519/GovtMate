"use client";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { AgentStatus } from "@/types";
import { Bot, CheckCircle, Loader2, AlertCircle, Clock } from "lucide-react";

const AGENTS = [
  { name: "Citizen Support", color: "#8EC5FC" },
  { name: "Form Filling", color: "#E0C3FC" },
  { name: "Document Verification", color: "#B5EAD7" },
  { name: "Eligibility Check", color: "#FFE5EC" },
  { name: "Scheme Recommendation", color: "#FFF4CC" },
  { name: "Workflow", color: "#D6EEFF" },
  { name: "Notification", color: "#DFF6E3" },
  { name: "Transparency", color: "#EBDCFF" },
];

interface AgentStatusPanelProps {
  agents?: AgentStatus[];
}

export function AgentStatusPanel({ agents = [] }: AgentStatusPanelProps) {
  const getAgentStatus = (name: string): AgentStatus => {
    return agents.find((a) => a.name === name) || { name, status: "idle", progress: 0 };
  };

  const statusIcon = (status: string) => {
    if (status === "running") return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    if (status === "completed") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === "error") return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#8EC5FC]" />
          AI Agent Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {AGENTS.map((agent, i) => {
          const status = getAgentStatus(agent.name);
          return (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: agent.color + "40" }}>
                <Bot className="w-4 h-4" style={{ color: agent.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{agent.name}</span>
                  {statusIcon(status.status)}
                </div>
                <Progress value={status.progress} size="sm" color={agent.color} />
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
