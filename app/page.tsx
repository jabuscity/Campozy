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

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen text-neutral-900">
      {/* Fixed Top Navigation - Elemental Style */}
      <header className="fixed top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-neutral-200 flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg transition-transform group-hover:scale-110">
              <School className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-neutral-900 uppercase italic">
              Campozy
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 ml-6">
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
          <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-primary">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-primary">
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
      </header>

      {/* Main Content - Elemental Layout */}
      <main className="flex-1 pt-20 pb-12">
        {/* Mobile: narrow column, Desktop: wide */}
        <div className="mx-auto max-w-7xl px-6">
          {/* Hero Section */}
          <section className="relative min-h-[500px] md:min-h-[600px] flex flex-col items-center justify-center px-6 overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-1/4 -left-20 w-64 h-56 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-4xl w-full text-center relative z-10">
              {/* Utility Alert Banner - Elemental Style */}
              <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full mb-6 border border-success/20">
                <Zap className="h-4 w-4" />
                <p className="text-sm font-bold">
                  Water reported{" "}
                  <span className="font-black">ON</span> at Madaraka Estate
                  Residences (10 mins ago by Scout)
                </p>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.1] mb-4">
                Decide with{" "}
                <span className="text-primary">Confidence.</span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 leading-relaxed mb-8 max-w-2xl mx-auto">
                Verified student residences in Nairobi. Real utility updates. Zero
                guesswork. The trust network built for Strathmore, UoN, JKUAT, and
                beyond.
              </p>

              {/* Search Shell - Elemental Style */}
              <div className="max-w-3xl mx-auto mb-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/5 rounded-full blur-lg opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
                  <div className="relative flex items-center bg-white border border-neutral-200 rounded-full p-2 pl-12 shadow-sm hover:shadow-md transition-all duration-300">
                    <Search className="absolute left-4 h-5 w-5 text-neutral-400" />
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

              {/* Category Pills - Elemental Style */}
              <div className="flex flex-wrap justify-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white font-bold text-sm transition-all hover:shadow-lg active:scale-95">
                  <Home className="h-4 w-4" />
                  Hostels
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-bold text-sm transition-all active:scale-95">
                  <School className="h-4 w-4" />
                  Universities
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-bold text-sm transition-all active:scale-95">
                  <MessageSquare className="h-4 w-4" />
                  Student Forums
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-bold text-sm transition-all active:scale-95">
                  <Droplet className="h-4 w-4" />
                  M-Pesa Hub
                </button>
              </div>
            </div>
          </section>

          {/* Bento Featured Section - Elemental Style */}
          <section className="mb-8 md:mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
              {/* Large Card: Main Housing Insight */}
              <div className="col-span-1 lg:col-span-7 rounded-xl border border-neutral-200 bg-white overflow-hidden flex flex-col md:flex-row group transition-all duration-300 hover:shadow-lg">
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
                <div className="md:w-1/2 p-5 flex flex-col justify-center">
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
                  <h3 className="text-xl font-black text-neutral-900 mb-3 tracking-tight">
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
              <div className="col-span-1 lg:col-span-5 grid grid-rows-2 gap-4">
                {/* Trust Metrics */}
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <ShieldCheck className="h-6 w-6 text-primary p-2 bg-white rounded-lg shadow-sm" />
                      <span className="text-success text-xs font-bold px-2 py-1 bg-success/10 rounded">
                        99.9% Verified
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-neutral-900 mb-2">
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
                <div className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col justify-between hover:bg-neutral-50 transition-all duration-300 cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-black text-neutral-900">
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

          {/* Trending Section - Elemental Style */}
          <section className="mb-8 md:mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">
                Trending Insights
              </h2>
              <Button variant="ghost" className="text-primary font-bold text-sm">
                See all
              </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-6 px-6 pb-4">
              {/* Insight Card 1 */}
              <div className="min-w-[280px] bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all cursor-pointer group">
                <div className="h-32 bg-neutral-100 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600"
                    alt="Hostel review"
                    fill
                    className="object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                    <Star className="h-3 w-3 text-secondary fill-current" />
                    <span className="text-xs font-bold">4.8</span>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-neutral-900">Westland Heights Review</h4>
                  <p className="text-sm text-neutral-500 line-clamp-2">
                    &quot;Great internet speeds and the management is very responsive...&quot;
                  </p>
                </div>
              </div>

              {/* Insight Card 2 */}
              <div className="min-w-[280px] bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all cursor-pointer group">
                <div className="h-32 bg-neutral-100 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db344?auto=format&fit=crop&q=80&w=600"
                    alt="Study spots"
                    fill
                    className="object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 text-primary" />
                    <span className="text-xs font-bold">New Post</span>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-neutral-900">Best Quiet Study Spots?</h4>
                  <p className="text-sm text-neutral-500 line-clamp-2">
                    Join the discussion on the most peaceful libraries around campus.
                  </p>
                </div>
              </div>

              {/* Insight Card 3 */}
              <div className="min-w-[280px] bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all cursor-pointer group">
                <div className="h-32 bg-neutral-100 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=600"
                    alt="Housing tips"
                    fill
                    className="object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                    <Droplet className="h-3 w-3 text-success" />
                    <span className="text-xs font-bold">Utility</span>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-neutral-900">Water Update: Juja</h4>
                  <p className="text-sm text-neutral-500 line-clamp-2">
                    Borehole water is now active at 12 hostels near JKUAT main campus.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Informational Section - Elemental Style */}
          <section className="bg-neutral-50 rounded-xl border border-neutral-200 p-6 md:p-8 mb-8 md:mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight mb-3">
                Kenyan Institutional Trust, Built by Students
              </h2>
              <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
                We bridge the gap between &quot;brochure promises&quot; and the
                actual student experience in East African campuses.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-neutral-900 mb-2">Verified Listings</h3>
                <p className="text-sm text-neutral-500">
                  Every hostel is physically audited by verified student scouts.
                </p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mx-auto mb-4">
                  <Droplet className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-neutral-900 mb-2">Live Utilities</h3>
                <p className="text-sm text-neutral-500">
                  Real-time water, electricity, and internet status updates.
                </p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 bg-success/10 rounded-xl flex items-center justify-center text-success mx-auto mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-neutral-900 mb-2">Community Driven</h3>
                <p className="text-sm text-neutral-500">
                  Reviews and ratings from actual students, not paid influencers.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Actions - Elemental Style */}
          <section className="mb-8 md:mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/discovery" className="group">
                <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-all h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <Home className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-neutral-900">Find Hostels</h3>
                  </div>
                  <p className="text-sm text-neutral-500">
                    Browse verified student residences across Nairobi, Juja, and Eldoret.
                  </p>
                </div>
              </Link>
              <Link href="/community" className="group">
                <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-all h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-neutral-900">Join Discussions</h3>
                  </div>
                  <p className="text-sm text-neutral-500">
                    Ask questions, share tips, and connect with other students.
                  </p>
                </div>
              </Link>
              <Link href="/opportunities" className="group">
                <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-all h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 bg-success/10 rounded-lg flex items-center justify-center text-success">
                      <Star className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-neutral-900">Opportunities</h3>
                  </div>
                  <p className="text-sm text-neutral-500">
                    Internships, scholarships, and jobs curated for students.
                  </p>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <School className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-neutral-900 uppercase tracking-tight">
              Campozy
            </span>
          </div>
          <p className="text-sm text-neutral-500">
            Built in Nairobi. Trusted by students across Kenya.
          </p>
          <div className="flex gap-6">
            <Link href="/about" className="text-sm text-neutral-500 hover:text-primary transition-colors">About</Link>
            <Link href="/privacy" className="text-sm text-neutral-500 hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="text-sm text-neutral-500 hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
