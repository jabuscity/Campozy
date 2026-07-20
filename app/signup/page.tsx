'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldCheck, ArrowLeft, GraduationCap, Building2, Search } from 'lucide-react'
import { signup } from '@/app/actions/auth-actions'
import { useState, useRef } from 'react'
import { UniversityTicker } from '@/components/university-ticker'
import Image from 'next/image'

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState<'student' | 'owner'>('student')
  const [showForm, setShowForm] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const handleGetStarted = () => {
    setShowForm(true)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
              <span className="text-xl font-bold italic">C</span>
            </div>
            <span className="text-xl font-black tracking-tight text-neutral-900 uppercase italic">
              Campozy
            </span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="font-bold text-neutral-600 hover:text-neutral-900">
              <ArrowLeft className="h-4 w-4 mr-2" /> Exit Onboarding
            </Button>
          </Link>
        </div>
      </nav>

      {/* Desktop Layout */}
      <div className="hidden lg:block flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <section className="grid grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
            {/* Left Column - Form */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">The Trust Network</span>
              </div>

              <h1 className="text-4xl font-black text-neutral-900 tracking-tight leading-tight">
                Create Your <span className="text-primary italic">Profile</span>
              </h1>

              <p className="text-lg text-neutral-600 leading-relaxed max-w-lg">
                Join Africa&apos;s largest student trust network. Choose your role and get started in seconds.
              </p>

              <form className="space-y-6" action={signup}>
                <input type="hidden" name="role" value={selectedRole} />

                {/* Role Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-black text-neutral-900 uppercase tracking-widest italic">Choose your role</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('student')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        selectedRole === 'student'
                          ? 'border-primary bg-primary/5'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <GraduationCap className={`h-6 w-6 mb-2 ${selectedRole === 'student' ? 'text-primary' : 'text-neutral-400'}`} />
                      <span className="block font-bold text-neutral-900">Student</span>
                      <span className={`text-[10px] font-bold uppercase tracking-tighter ${selectedRole === 'student' ? 'text-primary/80' : 'text-neutral-400'}`}>Looking for Hostels</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('owner')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        selectedRole === 'owner'
                          ? 'border-primary bg-primary/5'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <Building2 className={`h-6 w-6 mb-2 ${selectedRole === 'owner' ? 'text-primary' : 'text-neutral-400'}`} />
                      <span className="block font-bold text-neutral-900">Owner</span>
                      <span className={`text-[10px] font-bold uppercase tracking-tighter ${selectedRole === 'owner' ? 'text-primary/80' : 'text-neutral-400'}`}>List Properties</span>
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Full Name</label>
                    <input
                      name="fullName"
                      type="text"
                      required
                      placeholder="Enter your official name"
                      className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                  </div>

                  {selectedRole === 'student' ? (
                    <>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">
                          University Email <span className="font-normal normal-case text-neutral-400">(optional)</span>
                        </label>
                        <input
                          name="email"
                          type="email"
                          placeholder="name@university.ac"
                          className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Former School</label>
                        <input
                          name="formerSchool"
                          type="text"
                          required
                          placeholder="Enter your former school name"
                          className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Email</label>
                        <input
                          name="email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Phone Number</label>
                        <input
                          name="phone"
                          type="tel"
                          required
                          placeholder="+254 712 345 678"
                          className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Address</label>
                        <input
                          name="address"
                          type="text"
                          required
                          placeholder="Your physical address"
                          className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Secure Password</label>
                    <input
                      name="password"
                      type="password"
                      required
                      placeholder="Minimal 8 characters"
                      className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                    Create My Profile
                  </Button>
                  <p className="mt-4 text-center text-sm text-neutral-500 font-medium">
                    Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Right Column - Image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-xl relative">
                <Image
                  alt="Students in Nairobi campus"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db344?auto=format&fit=crop&q=80&w=1200"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl border border-neutral-200 shadow-lg max-w-[240px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                  <span className="text-xs font-bold text-secondary uppercase">Live Insight</span>
                </div>
                <p className="text-lg font-black text-neutral-900">98% Water Uptime</p>
                <p className="text-sm text-neutral-500">Verified in Juja student district today.</p>
              </div>
            </div>
          </section>

          {/* Three Pillars Section */}
          <section className="space-y-8 mb-24">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl font-black text-neutral-900 tracking-tight uppercase italic">The Three Pillars of Campozy</h2>
              <p className="text-neutral-600 text-lg">Built by students, for students. We bridge the gap between academic ambition and daily life reliability.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-2xl border border-neutral-200 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 mb-3 uppercase tracking-tight italic">Verified Hostels</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Don&apos;t gamble with your safety. Access hostels that have been physically inspected and community-vetted for standards and student-friendly management.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-neutral-200 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-6">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 mb-3 uppercase tracking-tight italic">Utility Intelligence</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Real-time data on water and power stability. Plan your study sessions with confidence using crowdsourced data across major campuses.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-neutral-200 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center text-success mb-6">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 mb-3 uppercase tracking-tight italic">Reputation Network</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Your academic journey is backed by a community. Exchange insights with verified students. Verified identity ensures high-trust dialogue.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex-1">
        {!showForm ? (
          <>
            {/* Hero Section */}
            <section className="relative w-full h-[50vh] flex-shrink-0">
              <div className="absolute inset-0 z-0">
                <Image
                  alt="Students in Nairobi campus"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db344?auto=format&fit=crop&q=80&w=1200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-50 via-neutral-50/80 to-transparent" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-end px-6 pb-8">
                <div className="inline-flex items-center gap-2 mb-3 text-primary bg-primary/10 backdrop-blur-md px-3 py-1 rounded-full w-fit">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Student Trust Network</span>
                </div>
                <h1 className="text-3xl font-black text-neutral-900 tracking-tight leading-tight mb-3">
                  Decide with <span className="text-primary italic">Confidence.</span>
                </h1>
                <p className="text-base text-neutral-600 leading-relaxed max-w-[300px]">
                  Find reliable campus living and utility updates across Nairobi universities.
                </p>
              </div>
            </section>

            {/* Feature Grid */}
            <section className="px-6 py-6 space-y-3">
              <div className="bg-white p-4 rounded-xl border border-neutral-200 flex items-center gap-3">
                <div className="w-12 h-12 flex-shrink-0 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-neutral-900">Verified Hostels</h3>
                  <p className="text-sm text-neutral-500">Vetted by students, for students.</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200 flex items-center gap-3">
                <div className="w-12 h-12 flex-shrink-0 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
                  <Search className="h-6 w-6" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-neutral-900">Live Utility Alerts</h3>
                  <p className="text-sm text-neutral-500">Real-time water and power status.</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200 flex items-center gap-3">
                <div className="w-12 h-12 flex-shrink-0 bg-success/10 rounded-lg flex items-center justify-center text-success">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-neutral-900">Student Reputation</h3>
                  <p className="text-sm text-neutral-500">Build credibility in the community.</p>
                </div>
              </div>
            </section>

            {/* Primary Actions */}
            <section className="px-6 py-6 space-y-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20"
              >
                Get Started
              </Button>
              <p className="text-center text-sm text-neutral-500 font-medium">
                Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
              </p>
              <div className="flex justify-center items-center gap-2 pt-2">
                <div className="h-1.5 w-6 bg-primary rounded-full"></div>
                <div className="h-1.5 w-1.5 bg-neutral-300 rounded-full"></div>
                <div className="h-1.5 w-1.5 bg-neutral-300 rounded-full"></div>
              </div>
            </section>
          </>
        ) : (
          /* Mobile Form Section */
          <div ref={formRef} className="px-6 py-8">
            <form className="space-y-6" action={signup}>
              <input type="hidden" name="role" value={selectedRole} />

              {/* Role Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-black text-neutral-900 uppercase tracking-widest italic">Choose your role</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('student')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedRole === 'student'
                        ? 'border-primary bg-primary/5'
                        : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <GraduationCap className={`h-6 w-6 mb-2 ${selectedRole === 'student' ? 'text-primary' : 'text-neutral-400'}`} />
                    <span className="block font-bold text-neutral-900">Student</span>
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${selectedRole === 'student' ? 'text-primary/80' : 'text-neutral-400'}`}>Looking for Hostels</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('owner')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedRole === 'owner'
                        ? 'border-primary bg-primary/5'
                        : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <Building2 className={`h-6 w-6 mb-2 ${selectedRole === 'owner' ? 'text-primary' : 'text-neutral-400'}`} />
                    <span className="block font-bold text-neutral-900">Owner</span>
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${selectedRole === 'owner' ? 'text-primary/80' : 'text-neutral-400'}`}>List Properties</span>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Full Name</label>
                  <input
                    name="fullName"
                    type="text"
                    required
                    placeholder="Enter your official name"
                    className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>

                {selectedRole === 'student' ? (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">
                        University Email <span className="font-normal normal-case text-neutral-400">(optional)</span>
                      </label>
                      <input
                        name="email"
                        type="email"
                        placeholder="name@university.ac"
                        className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Former School</label>
                      <input
                        name="formerSchool"
                        type="text"
                        required
                        placeholder="Enter your former school name"
                        className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Email</label>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Phone Number</label>
                      <input
                        name="phone"
                        type="tel"
                        required
                        placeholder="+254 712 345 678"
                        className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Address</label>
                      <input
                        name="address"
                        type="text"
                        required
                        placeholder="Your physical address"
                        className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Secure Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Minimal 8 characters"
                    className="w-full px-4 h-12 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                  Create My Profile
                </Button>
                <p className="mt-4 text-center text-sm text-neutral-500 font-medium">
                  Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>

      <UniversityTicker />
    </div>
  )
}
