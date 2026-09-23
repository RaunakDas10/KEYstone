import React from 'react';
import { Link } from 'react-router-dom';

const backgroundVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ================= HERO SECTION ================= */}
      <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
          aria-hidden="true"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>

        <nav
          className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-6"
          aria-label="Primary navigation"
        >
          <Link
            to="/"
            className="text-3xl tracking-tight text-[hsl(var(--foreground))]"
          >
            <span style={{ fontFamily: "'Instrument Serif', serif" }}>
              KEYStone<sup className="text-xs">®</sup>
            </span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <Link to="/" className="text-sm font-medium text-[hsl(var(--foreground))] transition-colors">
              Home
            </Link>
            <Link
              to="/how-it-works"
              className="text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
            >
              How It Works
            </Link>
            <Link
              to="/security"
              className="text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
            >
              Security
            </Link>
            <a
              href="mailto:support@keystone.demo"
              className="text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
            >
              Reach Us
            </a>
          </div>

          <Link
            to="/register?role=client"
            className="liquid-glass rounded-full px-6 py-2.5 text-sm text-[hsl(var(--foreground))] transition-transform duration-200 hover:scale-[1.03]"
          >
            <span className="relative z-10">Begin Journey</span>
          </Link>
        </nav>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-40 pt-32 text-center sm:py-[90px]">
          <h1
            className="animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] text-[hsl(var(--foreground))] sm:text-7xl md:text-8xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Where <em className="not-italic text-[hsl(var(--muted-foreground))]">trust</em> rises{' '}
            <em className="not-italic text-[hsl(var(--muted-foreground))]">through the silence.</em>
          </h1>

          <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-lg">
            We secure the space between a promise and a payout—giving thoughtful clients and talented builders a clear path to focused, inspired work.
          </p>

        <Link
          to="/register?role=client"
          className="liquid-glass animate-fade-rise-delay-2 mt-12 cursor-pointer rounded-full px-14 py-5 text-base text-[hsl(var(--foreground))] transition-transform duration-200 hover:scale-[1.03]"
        >
          <span className="relative z-10">Begin Journey</span>
        </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
