"use client";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileCheck, Bot, Clock, Sparkles, MessageSquare, FilePenLine,
  BadgeCheck, Award, Route, Bell, BarChart3, ScanEye, Info
} from "lucide-react";

const AGENTS = [
  {
    id: 1,
    name: "Citizen Support Agent",
    icon: MessageSquare,
    color: "#8EC5FC",
    description: "Understands citizen requests and suggests the correct government service to apply for.",
    responsibilities: [
      "Understands citizen requests",
      "Suggests the correct service",
    ],
  },
  {
    id: 2,
    name: "Smart Form Filling Agent",
    icon: FilePenLine,
    color: "#E0C3FC",
    description: "Automatically fills application forms using data extracted from documents and citizen profile.",
    responsibilities: [
      "Auto-fills forms",
      "Reduces manual typing",
    ],
  },
  {
    id: 3,
    name: "Document Verification Agent",
    icon: BadgeCheck,
    color: "#B5EAD7",
    description: "Uses OCR (Google Vision API) to verify uploaded documents and extract their contents.",
    responsibilities: [
      "Uses OCR",
      "Verifies uploaded documents",
    ],
  },
  {
    id: 4,
    name: "Eligibility Agent",
    icon: Award,
    color: "#FFE5EC",
    description: "Checks eligibility rules for the requested government service based on citizen data.",
    responsibilities: [
      "Checks eligibility rules",
    ],
  },
  {
    id: 5,
    name: "Scheme Recommendation Agent",
    icon: Sparkles,
    color: "#FFF4CC",
    description: "Suggests additional government schemes and benefits the citizen may qualify for.",
    responsibilities: [
      "Suggests additional government schemes",
    ],
  },
  {
    id: 6,
    name: "Workflow Agent",
    icon: Route,
    color: "#D6EEFF",
    description: "Routes applications to the correct departments and updates workflow stages.",
    responsibilities: [
      "Routes applications",
      "Updates workflow stages",
    ],
  },
  {
    id: 7,
    name: "Notification Agent",
    icon: Bell,
    color: "#FFD6A5",
    description: "Sends real-time notifications to citizens about application status updates.",
    responsibilities: [
      "Sends real-time notifications",
    ],
  },
  {
    id: 8,
    name: "Transparency Agent",
    icon: BarChart3,
    color: "#EBDCFF",
    description: "Displays application progress, builds the timeline, and tracks current status for citizens.",
    responsibilities: [
      "Displays application progress",
      "Shows timeline",
      "Tracks current status",
    ],
  },
];

function InformationContent() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-[#8EC5FC]" />
              About GovAssist AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              GovAssist AI is an autonomous multi-agent platform that simplifies the process of applying for government certificates and welfare schemes.
              Citizens upload their documents once, and our 8 AI agents handle every step of the application — from data extraction and verification
              to eligibility checks, form filling, department routing, and real-time transparency tracking.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanEye className="w-5 h-5 text-[#B5EAD7]" />
              Document Verification Technology
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#B5EAD7]/30 to-[#D6EEFF]/30 dark:from-[#B5EAD7]/10 dark:to-[#D6EEFF]/10 border border-[#B5EAD7]/40 dark:border-[#B5EAD7]/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#B5EAD7] dark:bg-[#B5EAD7]/20 flex items-center justify-center">
                    <ScanEye className="w-5 h-5 text-[#2d7a5a] dark:text-[#B5EAD7]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Google Vision API (OCR)</h4>
                    <p className="text-xs text-gray-500">Optical Character Recognition Engine</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4" /> Purpose
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "Extract text from uploaded documents",
                  "Read Aadhaar card details",
                  "Read Income Certificate data",
                  "Read Community / Caste Certificates",
                  "Verify uploaded documents authenticity",
                  "Detect missing information",
                ].map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.03 }}
                    className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Estimated Verification Time
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#D6EEFF]/40 dark:bg-blue-900/20 border border-[#D6EEFF] dark:border-blue-800">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Prototype</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">30–60 seconds</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">(simulated)</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#EBDCFF]/40 dark:bg-purple-900/20 border border-[#EBDCFF] dark:border-purple-800">
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Real-world Government Processing</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">3–7 working days</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">(varies by department and document type)</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">Important Note</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                    This prototype simulates the verification workflow. Actual government processing times depend on departmental review and official procedures.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Bot className="w-6 h-6 text-[#E0C3FC]" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Agents</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {AGENTS.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.04 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full card-hover overflow-hidden">
                  <div className="h-1.5" style={{ background: `linear-gradient(to right, ${agent.color}, ${agent.color}aa)` }} />
                  <CardContent className="p-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${agent.color}30` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: agent.color }} />
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-gray-700 dark:text-gray-300" style={{ backgroundColor: `${agent.color}50` }}>
                        {agent.id}
                      </span>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">{agent.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">{agent.description}</p>
                    <div className="space-y-1.5 pt-3 border-t border-[#E5E7EB] dark:border-gray-700">
                      {agent.responsibilities.map((r) => (
                        <div key={r} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: agent.color }} />
                          <p className="text-xs text-gray-600 dark:text-gray-400">{r}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}

function Check({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function InformationPageWrapper() {
  return (
    <DashboardLayout title="Information" subtitle="About the platform, technology, and AI agents">
      <InformationContent />
    </DashboardLayout>
  );
}

export default function InformationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[#8EC5FC] border-t-transparent rounded-full" /></div>}>
      <InformationPageWrapper />
    </Suspense>
  );
}
