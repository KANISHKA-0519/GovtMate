"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles, Shield, Zap, Users, FileCheck, Bell, BarChart3,
  ArrowRight, CheckCircle, Star, Globe, Lock, ChevronRight
} from "lucide-react";

const features = [
  { icon: Sparkles, title: "8 AI Agents", desc: "Autonomous agents handle every step of your application", color: "#8EC5FC" },
  { icon: FileCheck, title: "Smart Verification", desc: "OCR-powered document verification with 99% accuracy", color: "#E0C3FC" },
  { icon: Shield, title: "Eligibility Check", desc: "Instant eligibility assessment for 100+ schemes", color: "#B5EAD7" },
  { icon: Bell, title: "Real-time Updates", desc: "Live notifications at every stage of your application", color: "#FFE5EC" },
  { icon: BarChart3, title: "Full Transparency", desc: "Track your application with complete audit trail", color: "#FFF4CC" },
  { icon: Zap, title: "10x Faster", desc: "Complete applications in minutes, not weeks", color: "#D6EEFF" },
];

const workflow = [
  { step: "01", title: "Upload Documents", desc: "Drag & drop your documents once" },
  { step: "02", title: "AI Verification", desc: "Agents verify and extract data automatically" },
  { step: "03", title: "Eligibility Check", desc: "Instant eligibility assessment" },
  { step: "04", title: "Auto-fill Forms", desc: "Smart form filling from your documents" },
  { step: "05", title: "Track Progress", desc: "Real-time transparency dashboard" },
  { step: "06", title: "Get Approved", desc: "Receive certificate digitally" },
];

const stats = [
  { value: "2M+", label: "Citizens Served" },
  { value: "50+", label: "Government Services" },
  { value: "99.2%", label: "Accuracy Rate" },
  { value: "< 5min", label: "Average Processing" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#E5E7EB]/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8EC5FC] to-[#E0C3FC] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100">GovAssist AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <a href="#features" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">How it Works</a>
            <a href="#stats" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Impact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get Started <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#8EC5FC]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#E0C3FC]/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-[#D6EEFF] dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Powered by Groq AI + LangGraph Multi-Agent System
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6"
          >
            Government Services,{" "}
            <span className="bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC] bg-clip-text text-transparent">
              Reimagined
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10"
          >
            Upload your documents once. Our 8 autonomous AI agents handle everything — verification, eligibility, form filling, and approval tracking.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/sign-up">
              <Button size="lg" className="px-8">
                Start Your Application <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="px-8">
                View Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6 mt-12 text-sm text-gray-500"
          >
            <div className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> Aadhaar Secured</div>
            <div className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> 28 States</div>
            <div className="flex items-center gap-1.5"><Star className="w-4 h-4" /> 4.9/5 Rating</div>
            <div className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 2M+ Citizens</div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl font-bold bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC] bg-clip-text text-transparent">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Everything You Need</h2>
            <p className="text-gray-500 max-w-xl mx-auto">A complete AI-powered platform for all government services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full card-hover">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: f.color + "30" }}>
                      <f.icon className="w-6 h-6" style={{ color: f.color }} />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-500">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">How It Works</h2>
            <p className="text-gray-500">Six simple steps to get your government certificate</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflow.map((w, i) => (
              <motion.div
                key={w.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8EC5FC] to-[#E0C3FC] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {w.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{w.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{w.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC] rounded-3xl p-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-gray-700 mb-8">Join 2 million citizens who have simplified their government service experience</p>
            <Link href="/sign-up">
              <Button size="lg" variant="outline" className="bg-white hover:bg-gray-50 border-white px-8">
                Create Free Account <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#E5E7EB] dark:border-gray-700">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#8EC5FC] to-[#E0C3FC] flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GovAssist AI</span>
          </div>
          <p className="text-xs text-gray-400">© 2025 GovAssist AI. Built for National Hackathon. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Terms</a>
            <a href="#" className="hover:text-gray-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
