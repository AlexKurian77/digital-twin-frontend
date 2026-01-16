"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Microscope, Lightbulb, Heart, Globe } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Policy Simulator", icon: <Microscope className="w-4 h-4" /> },
    { href: "/solutions", label: "Solutions", icon: <Lightbulb className="w-4 h-4" /> },
    { href: "/health-impact", label: "Health Impact", icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <nav className="sticky top-0 z-60 glass-nav border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 shadow-[0_0_15px_rgba(217,2,130,0.5)]">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight group-hover:text-pink-200 transition-colors">
              <span className="text-pink-500">CARMA</span>
            </span>
            <span className="text-sm font-medium text-slate-400">Urban digital twin</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="flex items-center gap-8">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 text-sm font-medium transition-all duration-300 ${isActive ? "text-pink-400" : "text-slate-400 hover:text-white"
                  }`}
              >
                {/* Glow dot for active state */}
                {isActive && (
                  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_10px_#d90282]" />
                )}

                <span className={isActive ? "text-pink-400" : "opacity-70 group-hover:opacity-100"}>
                  {link.icon}
                </span>
                {link.label}
              </Link>
            );
          })}

          {/* Action Button (Style only) */}
          {/* <button className="ml-4 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
            Connect
          </button> */}
        </div>
      </div>
    </nav>
  );
}
