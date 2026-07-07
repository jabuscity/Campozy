"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, ShieldCheck, Users, ArrowRight, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen text-neutral-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 pb-32">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge
                variant="success"
                className="mb-6 px-4 py-1.5 text-sm uppercase tracking-wider font-bold"
              >
                Live at 50+ Campuses
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-neutral-900 tracking-tight leading-[1.1] mb-8">
                Your Student <span className="text-primary italic">Trust</span>{" "}
                Network.
              </h1>
              <p className="text-xl text-neutral-600 leading-relaxed mb-10 max-w-lg font-medium">
                Stop guessing where to live. Join thousands of students across
                Africa building a verified housing ecosystem based on
                intelligence, not myths.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/discovery" className="flex-1 sm:flex-none">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gap-2 text-lg font-bold shadow-xl shadow-primary/20"
                  >
                    Find Housing <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-lg font-bold border-2"
                  >
                    Join the Network
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-12 w-12 rounded-full border-4 border-white bg-neutral-200 overflow-hidden shadow-sm"
                    >
                      <Image
                        src={`https://i.pravatar.cc/100?u=${i}`}
                        alt="Student"
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-secondary">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-neutral-500 font-bold uppercase tracking-tight">
                    Trusted by African Students
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="hidden lg:block relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="absolute -top-12 -right-12 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-neutral-200">
                <Image
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db344?auto=format&fit=crop&q=80&w=1200"
                  alt="Student Community"
                  width={800}
                  height={1000}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-8 left-8 p-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl max-w-xs border border-white/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center text-white">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <span className="font-black text-neutral-900 uppercase tracking-tighter text-sm italic">
                      Verified Stay
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed font-bold">
                    &ldquo;Finally found a place with reliable water and wifi.
                    The Campozy Score didn&rsquo;t lie!&rdquo;
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-neutral-50 py-32 border-y border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard
              icon={<Search />}
              title="Housing Discovery"
              desc="Filter by university, walk-times, and reliable utilities. See what others won't tell you."
              delay={0.1}
            />
            <FeatureCard
              icon={<ShieldCheck />}
              title="Trust Scoring"
              desc="Our 10-dimension scoring engine ensures every hostel is rated on safety, water, wifi, and hygiene."
              delay={0.2}
              active
            />
            <FeatureCard
              icon={<Users />}
              title="Community Graph"
              desc="Get real-time tips from scouts, founders, and students who have been there before."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-white/5 skew-x-12" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative text-center">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter italic uppercase">
            Reclaim your <br className="hidden md:block" /> student life
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-neutral-100 px-12 h-20 text-2xl font-black rounded-2xl shadow-2xl"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  delay,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
  active?: boolean;
}) {
  return (
    <motion.div
      className={cn(
        "p-12 rounded-[2.5rem] border transition-all",
        active
          ? "bg-white shadow-2xl border-primary/10 scale-105 z-10"
          : "bg-white/50 border-neutral-200 hover:bg-white hover:shadow-xl",
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <div
        className={cn(
          "h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-10 transition-transform",
          active ? "bg-primary text-white" : "bg-neutral-100 text-neutral-400",
        )}
      >
        {React.isValidElement<{ className?: string }>(icon)
          ? React.cloneElement(icon, { className: "h-8 w-8" })
          : icon}
      </div>
      <h3 className="text-2xl font-black mb-4 text-center tracking-tight uppercase italic">
        {title}
      </h3>
      <p className="text-neutral-500 leading-relaxed text-center font-medium">
        {desc}
      </p>
    </motion.div>
  );
}
