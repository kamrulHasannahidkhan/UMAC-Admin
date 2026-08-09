"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type NoticeBannerContent = {
  headingPlain: string;
  headingHighlight: string;
  bgImage: string;
  logoImage?: string;
};

const API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL;

export default function NoticeBanner() {
  const [content, setContent] = useState<NoticeBannerContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/notice-banner`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setContent(json.data);
      })
      .catch((err) => console.error("Failed to load notice banner:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <section className="w-full h-[480px] bg-gray-100 animate-pulse" />;
  }

  if (!content) {
    return (
      <section className="w-full py-20 text-center text-gray-400">
        No Notice & Media banner yet — add it from the admin panel.
      </section>
    );
  }

  return (
    <section className="relative w-full h-[480px] flex items-center justify-center overflow-hidden bg-[#e4f3e6]">
      {/* 1. Background Pattern Illustration */}
      <Image
        src={content.bgImage}
        alt="Banner Background"
        fill
        className="object-cover object-center"
        sizes="100vw"
        priority
      />

      {/* 2. 70% Blurred Green Overlay Box */}
      <div className="relative z-10 max-w-7xl w-[92%] mx-auto h-[280px] bg-[#9bcbb1]/70 backdrop-blur-md rounded-sm px-8 md:px-14 flex items-center justify-between shadow-sm">
        {/* Left Side: Breadcrumbs & Page Heading */}
        <div className="flex flex-col justify-center">
          {/* Breadcrumb Navigation (2-level, no sub-tab) */}
          <div className="text-sm md:text-base font-bold text-gray-800 tracking-wider mb-3 flex items-center gap-2 uppercase">
            <Link href="/" className="hover:text-[#008d44] transition-colors">
              HOME
            </Link>
            <span className="text-gray-700 font-semibold">&gt;</span>
            <span className="text-[#008d44] font-bold">NOTICE & MEDIA</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-serif text-[#2d3748]">
            {content.headingPlain}{" "}
            <span className="font-bold text-[#008d44]">{content.headingHighlight}</span>
          </h1>
        </div>

        {/* Right Side: Institutional Logo Seal */}
        <div className="relative w-44 h-44 md:w-52 md:h-52 flex-shrink-0 drop-shadow-sm">
          <Image
            src={content.logoImage || "/logo.png"}
            alt="UAMC Logo"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 176px, 208px"
          />
        </div>
      </div>
    </section>
  );
}
