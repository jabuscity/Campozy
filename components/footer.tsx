'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cloneElement, type ReactElement } from "react";
import { ShieldCheck, Globe } from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import Image from "next/image";

export function Footer() {
  const pathname = usePathname()
  const showMobileFooter = pathname === '/' || pathname === '/about'
  return (
     <footer className="bg-neutral-900 text-white pt-12 pb-12 lg:pb-6 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-success" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {showMobileFooter && (
          <div className="md:hidden flex flex-col items-start justify-between gap-4 pt-0 pb-4">
            <div className="flex items-center gap-2">
               <Image src="/logo.png" alt="Campozy" width={4096} height={3264} className="h-11 w-auto" />
               <span className="text-xl font-black tracking-tight text-white">
                 Campozy
               </span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed font-medium text-left">
              Mapping student trust across Africa. Housing, community, and
              opportunity intelligence for the next generation of leaders.
            </p>

            <div className="bg-white/5 rounded-2xl border border-white/10 p-4 w-full">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="h-5 w-5 text-success" />
                <span className="text-xs font-black uppercase tracking-widest">
                  Trust First
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                All data is human-verified and student-curated. We prioritize
                privacy and safety in every corner of the network.
              </p>
              <Link
                href="/privacy"
                className="inline-block mt-4 text-xs font-bold text-primary hover:underline uppercase tracking-widest"
              >
                Read Privacy Constitution
              </Link>
            </div>

            <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest text-center mb-12">
              © 2026 Campozy Student Trust Network. All Rights Reserved.
            </div>
          </div>
        )}

        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 lg:items-start gap-6 mb-6">
          <div className="space-y-4 lg:col-span-1 relative">
            <div className="absolute -left-4 top-0 bottom-0 w-28 opacity-[0.10] bg-blue-200/20 bg-[url('/patterns/beadmosaic.png')] bg-center mix-blend-screen grayscale bg-[length:180px] lg:bg-[length:220px]" />
            <Link href="/" className="flex items-center gap-2 group relative">
            <Image src="/logo.png" alt="Campozy" width={4096} height={3264} className="h-11 w-auto" />
            <span className="text-2xl font-black tracking-tighter">
              Campozy
            </span>
          </Link>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs font-medium">
              Mapping student trust across Africa. Housing, community, and
              opportunity intelligence for the next generation of leaders.
            </p>
            <div className="flex items-center gap-4">
              <SocialLink href="#" icon={<FaXTwitter />} />
              <SocialLink href="#" icon={<FaInstagram />} />
              <SocialLink href="#" icon={<FaLinkedinIn />} />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-neutral-500">
              Product
            </h4>
            <ul className="space-y-3 font-medium text-sm text-neutral-300">
              <li>
                <FooterLink href="/discovery">Housing Portal</FooterLink>
              </li>
              <li>
                <FooterLink href="/universities">Universities</FooterLink>
              </li>
              <li>
                <FooterLink href="/neighborhoods">Neighborhoods</FooterLink>
              </li>
              <li>
                <FooterLink href="/opportunities">Opportunities</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-neutral-500">
              Trust
            </h4>
            <ul className="space-y-3 font-medium text-sm text-neutral-300">
              <li>
                <FooterLink href="/scouts">Scout Program</FooterLink>
              </li>
              <li>
                <FooterLink href="/verification">Verification</FooterLink>
              </li>
              <li>
                <FooterLink href="/recommendations">Recommendations</FooterLink>
              </li>
              <li>
                <FooterLink href="/parents">Parent Confidence</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-neutral-500">
              Legal
            </h4>
            <ul className="space-y-3 font-medium text-sm text-neutral-300">
              <li>
                <FooterLink href="/terms">Terms of Service</FooterLink>
              </li>
              <li>
                <FooterLink href="/privacy">Privacy Policy</FooterLink>
              </li>
              <li>
                <FooterLink href="/cookies">Cookies</FooterLink>
              </li>
              <li>
                <FooterLink href="/about">About Campozy</FooterLink>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="h-5 w-5 text-success" />
              <span className="text-xs font-black uppercase tracking-widest">
                Trust First
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
              All data is human-verified and student-curated. We prioritize
              privacy and safety in every corner of the network.
            </p>
          </div>
        </div>

        <div className="hidden md:flex pt-6 border-t border-white/5 flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-[0.3em]">
            © 2026 Campozy Student Trust Network. All Rights Reserved.
          </div>

          <div className="flex items-center gap-6 text-[10px] font-black text-neutral-500 uppercase tracking-widest">
            <div className="flex items-center gap-2 text-white">
              <Globe className="h-3 w-3" />
              <span>EN-KE</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  icon,
}: {
  href: string;
  icon: ReactElement<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:bg-primary hover:border-primary hover:text-white transition-all"
    >
      {cloneElement(icon, { className: "h-4 w-4" })}
    </Link>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="hover:text-primary transition-colors block">
      {children}
    </Link>
  );
}
