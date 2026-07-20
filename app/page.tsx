"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Search,
  ShieldCheck,
  Users,
  Star,
  Zap,
  Droplet,
  School,
  Home,
  MessageSquare,
  Bell,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { UniversityTicker } from "@/components/university-ticker";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen text-neutral-900">
      {/* Fixed Top Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg transition-transform group-hover:scale-110">
                <School className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-neutral-900 uppercase italic">
                Campozy
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-primary font-bold border-b-2 border-primary pb-1 text-sm uppercase tracking-tight"
              >
                Home
              </Link>
              <Link
                href="/discovery"
                className="text-neutral-500 font-medium hover:text-primary transition-colors text-sm uppercase tracking-tight"
              >
                Hostels
              </Link>
              <Link
                href="/universities"
                className="text-neutral-500 font-medium hover:text-primary transition-colors text-sm uppercase tracking-tight"
              >
                Universities
              </Link>
              <Link
                href="/opportunities"
                className="text-neutral-500 font-medium hover:text-primary transition-colors text-sm uppercase tracking-tight"
              >
                Opportunities
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-neutral-500">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-neutral-500">
              <HelpCircle className="h-5 w-5" />
            </Button>
              <div className="h-9 w-9 rounded-full overflow-hidden border border-neutral-200 bg-neutral-100">
                <Image
                  src="https://i.pravatar.cc/100?u=1"
                  alt="Profile"
                  width={36}
                  height={36}
                  className="object-cover"
                />
              </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-20">
        {/* Decorative background */}
        <div className="absolute top-1/4 -left-20 w-64 h-56 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl w-full text-center relative z-10">
          {/* Utility Alert Banner */}
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full mb-8 border border-success/20">
            <Zap className="h-4 w-4" />
            <p className="text-sm font-bold">
              Water reported{" "}
              <span className="font-black">ON</span> at Madaraka Estate
              Residences (10 mins ago by Scout)
            </p>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-neutral-900 tracking-tight leading-[1.1] mb-6">
            Decide with{" "}
            <span className="text-primary italic">Confidence.</span>
          </h1>
          <p className="text-xl text-neutral-600 leading-relaxed mb-10 max-w-2xl mx-auto font-medium">
            Verified student residences in Nairobi. Real utility updates. Zero
            guesswork. The trust network built for Strathmore, UoN, JKUAT, and
            beyond.
          </p>

          {/* Search Shell */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-lg opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
              <div className="relative flex items-center bg-white border border-neutral-200 rounded-full p-2 pl-6 shadow-sm hover:shadow-md transition-all duration-300">
                <Search className="h-5 w-5 text-neutral-400" />
                <input
                  className="flex-grow bg-transparent border-none focus:ring-0 text-base font-medium px-4 text-neutral-900 placeholder:text-neutral-400"
                  placeholder="Search for Westlands hostels, Juja rentals, or campus insights..."
                />
                <Button className="px-8 h-12 rounded-full font-bold shadow-lg shadow-primary/20">
                  Search Kenya Network
                </Button>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white font-bold text-sm transition-all hover:shadow-lg">
              <Home className="h-4 w-4" />
              Hostels
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-bold text-sm transition-all">
              <School className="h-4 w-4" />
              Universities
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-bold text-sm transition-all">
              <MessageSquare className="h-4 w-4" />
              Student Forums
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-bold text-sm transition-all">
              <Droplet className="h-4 w-4" />
              M-Pesa Hub
            </button>
          </div>
        </div>
      </section>

      {/* Bento Featured Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Large Card: Main Housing Insight */}
          <div className="col-span-1 lg:col-span-7 rounded-2xl border border-neutral-200 bg-white overflow-hidden flex flex-col md:flex-row group transition-all duration-300 hover:shadow-xl">
            <div className="md:w-1/2 relative h-56 md:h-auto min-h-[240px]">
              <Image
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"
                alt="Modern student apartment in Westlands"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-lg text-xs font-bold">
                Top Rated Hostel: Westlands
              </div>
            </div>
            <div className="md:w-1/2 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-secondary font-bold flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current" />
                  4.9
                </span>
                <span className="text-neutral-300">•</span>
                <span className="text-neutral-500 text-sm font-medium">
                  1,240 Verified Reviews
                </span>
              </div>
              <h3 className="text-2xl font-black text-neutral-900 mb-3 tracking-tight">
                The Westlands Residency
              </h3>
              <p className="text-neutral-600 mb-6 leading-relaxed">
                Premier living for university students. Secure parking, fast
                Wi-Fi, and 24/7 borehole water verified by 400+ residents this
                month. Starting from{" "}
                <span className="font-black text-primary">KSh 35,000/month</span>.
              </p>
              <Link
                href="#"
                className="text-primary font-bold inline-flex items-center gap-2 group/link"
              >
                View Full Report
                <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Secondary Cards: Trust Metrics + Live Feed */}
          <div className="col-span-1 lg:col-span-5 grid grid-rows-2 gap-5">
            {/* Trust Metrics */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary p-2 bg-white rounded-lg shadow-sm" />
                  <span className="text-success text-xs font-bold px-2 py-1 bg-success/10 rounded">
                    99.9% Verified
                  </span>
                </div>
                <h4 className="text-xl font-black text-neutral-900 mb-2">
                  Verified by Kenyan Scouts
                </h4>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Real-time utility monitoring by our trusted network of students
                  in Nairobi, Juja, and Eldoret.
                </p>
              </div>
              <div className="flex -space-x-3 overflow-hidden mt-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full ring-2 ring-white bg-neutral-200 overflow-hidden"
                  >
                    <Image
                      src={`https://i.pravatar.cc/100?u=${i + 10}`}
                      alt="Scout"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                ))}
                <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-neutral-100 text-[10px] font-black text-neutral-600">
                  +2k
                </div>
              </div>
            </div>

            {/* Live Nairobi Feed */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 flex flex-col justify-between hover:bg-neutral-50 transition-all duration-300 cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-black text-neutral-900">
                  Live Nairobi Feed
                </h4>
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-success absolute" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-neutral-500" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <p className="text-sm font-bold text-neutral-900">
                        KPLC Stable
                      </p>
                      <span className="text-xs text-neutral-400">Just now</span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Madaraka Near Strathmore
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Droplet className="h-5 w-5 text-neutral-500" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <p className="text-sm font-bold text-neutral-900">
                        Water Supply Active
                      </p>
                      <span className="text-xs text-neutral-400">2h ago</span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Juja JKUAT Surroundings
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Informational Section */}
      <section className="bg-neutral-50 py-16 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mb-4">
              Kenyan Institutional Trust, Built by Students
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              We bridge the gap between &quot;brochure promises&quot; and the
              actual student experience in East African campuses.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-black text-neutral-900 mb-2">
                Kenya-Wide Standards
              </h4>
              <p className="text-neutral-600 leading-relaxed">
                Every report is cross-referenced with geolocation and student IDs
                to ensure relevance for the local market.
              </p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-black text-neutral-900 mb-2">
                Scout Insights
              </h4>
              <p className="text-neutral-600 leading-relaxed">
                Real students from Strathmore, JKUAT, and UoN provide the inside
                scoop on commute times and security.
              </p>
            </div>
            <div className="text-center">
              <Droplet className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-black text-neutral-900 mb-2">
                Utility Transparency
              </h4>
              <p className="text-neutral-600 leading-relaxed">
                Know the status of KPLC power, water tankers, and Wi-Fi providers
                before you pay your deposit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Local Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-neutral-200">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mb-4">
              Find Your Fit Near Your Campus
            </h2>
            <p className="text-lg text-neutral-600 mb-8">
              Whether you&apos;re looking for a quiet bedsitter in Juja or a
              shared student residence in Westlands, our verified listings help
              you find safe, reliable housing.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <p className="text-xl font-black text-primary">KSh 15k+</p>
                <p className="text-xs text-neutral-500">Juja / JKUAT Area</p>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <p className="text-xl font-black text-primary">KSh 25k+</p>
                <p className="text-xs text-neutral-500">Madaraka / Strathmore</p>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <p className="text-xl font-black text-primary">KSh 35k+</p>
                <p className="text-xs text-neutral-500">Westlands / Parklands</p>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <p className="text-xl font-black text-primary">KSh 20k+</p>
                <p className="text-xs text-neutral-500">Roysambu / USIU</p>
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
            <Image
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"
              alt="Students in Nairobi"
              width={600}
              height={400}
              className="rounded-2xl shadow-xl w-full object-cover aspect-video"
            />
          </div>
        </div>
      </section>

      <UniversityTicker />
    </div>
  );
}
