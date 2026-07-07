import Link from "next/link";
import { cloneElement, type ReactElement } from "react";
import { ShieldCheck, Globe } from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white pt-24 pb-12 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-success" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg transition-transform group-hover:scale-110">
                <span className="text-xl font-bold italic">C</span>
              </div>
              <span className="text-2xl font-black tracking-tighter italic">
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
            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-neutral-500">
              Intelligence
            </h4>
            <ul className="space-y-4 font-bold text-neutral-300">
              <li>
                <FooterLink href="/discovery">Housing Portal</FooterLink>
              </li>
              <li>
                <FooterLink href="/trust">Scoring Engine</FooterLink>
              </li>
              <li>
                <FooterLink href="/scouts">Scout Program</FooterLink>
              </li>
              <li>
                <FooterLink href="/verification">Verification</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-neutral-500">
              Community
            </h4>
            <ul className="space-y-4 font-bold text-neutral-300">
              <li>
                <FooterLink href="/community">The Feed</FooterLink>
              </li>
              <li>
                <FooterLink href="/founders">Founders Program</FooterLink>
              </li>
              <li>
                <FooterLink href="/mentorship">Mentorship</FooterLink>
              </li>
              <li>
                <FooterLink href="/ambassadors">Ambassadors</FooterLink>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-6 w-6 text-success" />
              <span className="text-sm font-black uppercase tracking-widest italic">
                Trust First
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium mb-6">
              All data is human-verified and student-curated. We prioritize
              privacy and safety.
            </p>
            <Link
              href="/privacy"
              className="text-xs font-bold text-primary hover:underline"
            >
              Read Privacy Constitution
            </Link>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">
            © 2026 Campozy Student Trust Network. All Rights Reserved.
          </div>

          <div className="flex items-center gap-6 text-[10px] font-black text-neutral-500 uppercase tracking-widest">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/cookies"
              className="hover:text-white transition-colors"
            >
              Cookies
            </Link>
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
      className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:bg-primary hover:border-primary hover:text-white transition-all"
    >
      {cloneElement(icon, { className: "h-5 w-5" })}
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
