"use client";

import { useState, useEffect } from "react";

export default function MemePage() {
  const [visible, setVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setStatsVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div
        className={`w-full max-w-xl transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Tweet-style card */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-5 pb-4">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-cyan-500/20">
                <CloudIcon />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-[15px]">Mr. Cloud</span>
                  <VerifiedBadge />
                  <span className="text-slate-500 text-sm">@mr_cloud</span>
                  <span className="text-slate-600 text-sm">&middot; now</span>
                </div>
              </div>
            </div>

            {/* Post body */}
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed">
              <p className="text-white text-xl font-semibold">
                Who let the cloud out?{" "}
                <span className="text-cyan-400">We did.</span>
              </p>

              <p className="text-slate-300">
                <span className="text-white font-semibold">Mission Control</span> brings
                new functionality to your VPS that enables it to be more than
                just a blinking cursor in a terminal.
              </p>

              <div className="text-slate-300">
                <p className="mb-2">It can now become active infrastructure:</p>
                <div className="space-y-1.5 text-slate-300">
                  <BulletPoint text="real-time pulse monitoring" />
                  <BulletPoint text="integrated into your ops workflow" />
                  <BulletPoint text="potentially preventing 3 AM pages" />
                </div>
              </div>

              <p className="text-slate-400">
                Fun fact: Mr. Cloud has mass-scanned every port on your box
                and{" "}
                <span className="text-cyan-400 font-medium cursor-pointer hover:underline">
                  Show more
                </span>
              </p>
            </div>
          </div>

          {/* Demo card embed */}
          <div className="mx-6 mb-4">
            <div className="rounded-xl overflow-hidden border border-[#1e293b]">
              <div className="bg-gradient-to-br from-cyan-400 via-cyan-300 to-blue-400 p-6 relative">
                {/* Glitch blocks */}
                <div className="absolute top-0 right-0 w-24 h-full flex flex-col gap-1 opacity-60">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-[#020617] h-3"
                      style={{
                        width: `${40 + Math.random() * 60}%`,
                        marginLeft: "auto",
                      }}
                    />
                  ))}
                </div>

                <p className="text-cyan-800 text-xs font-medium tracking-wide mb-1">
                  DevOps R&D &middot; March 2026
                </p>
                <h3 className="text-[#020617] text-3xl font-bold leading-tight">
                  Mission
                  <br />
                  Control
                </h3>
                <p className="text-cyan-900 text-sm mt-2 italic">
                  with Mr. Cloud
                </p>

                {/* Logo area */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#020617] flex items-center justify-center">
                    <span className="text-cyan-400 text-xs">
                      <CloudIconSmall />
                    </span>
                  </div>
                  <span className="text-[#020617] text-xs font-bold tracking-wider uppercase">
                    Mission Control
                  </span>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-4 left-6">
                  <span className="bg-[#020617]/80 text-cyan-300 text-xs font-mono px-2 py-1 rounded">
                    24/7
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement bar */}
          <div
            className={`px-6 py-3 border-t border-[#1e293b] flex items-center justify-between text-slate-500 text-sm transition-all duration-500 ${
              statsVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <EngagementStat icon="comment" count={42} />
            <EngagementStat icon="repost" count={128} />
            <EngagementStat icon="heart" count={404} highlight />
            <EngagementStat icon="views" count="13K" />
            <div className="flex gap-3 text-slate-600">
              <BookmarkIcon />
              <ShareIcon />
            </div>
          </div>
        </div>

        {/* Watermark */}
        <p className="text-center text-slate-700 text-xs mt-4 font-mono">
          powered by mr. cloud meme machine
        </p>
      </div>
    </div>
  );
}

/* ── Icons & Sub-components ───────────────────────────────── */

function CloudIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  );
}

function CloudIconSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="10" fill="#1d9bf0" />
      <path d="M9.5 14.25L6.75 11.5L7.81 10.44L9.5 12.13L14.19 7.44L15.25 8.5L9.5 14.25Z" fill="white" />
    </svg>
  );
}

function BulletPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-cyan-400">&bull;</span>
      <span>{text}</span>
    </div>
  );
}

function EngagementStat({
  icon,
  count,
  highlight,
}: {
  icon: string;
  count: number | string;
  highlight?: boolean;
}) {
  const icons: Record<string, React.ReactNode> = {
    comment: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    repost: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
    heart: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill={highlight ? "#f43f5e" : "none"} stroke={highlight ? "#f43f5e" : "currentColor"} strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    views: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="4" height="18" rx="1" /><rect x="10" y="8" width="4" height="13" rx="1" /><rect x="17" y="5" width="4" height="16" rx="1" />
      </svg>
    ),
  };

  return (
    <div className={`flex items-center gap-1.5 ${highlight ? "text-rose-500" : ""}`}>
      {icons[icon]}
      <span className="text-xs">{count}</span>
    </div>
  );
}

function BookmarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}
