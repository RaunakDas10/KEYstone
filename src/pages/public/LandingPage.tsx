import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Quote, Plus, CheckCircle2, X, Sparkles } from 'lucide-react';

const backgroundVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4';

interface ClientReview {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  comment: string;
  projectCategory: string;
  date: string;
  verified: boolean;
}

const INITIAL_REVIEWS: ClientReview[] = [
  {
    id: 'rev_1',
    name: 'Arjun Mehta',
    role: 'Founder & CEO',
    company: 'NovasAI Systems',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    rating: 5,
    comment:
      'KEYStone eliminated all our anxiety around remote freelance contracts. Locking funds in escrow and releasing them only after verifying live demos gave us 100% confidence.',
    projectCategory: 'AI Platform Engineering',
    date: 'August 2026',
    verified: true,
  },
  {
    id: 'rev_2',
    name: 'Sarah Jenkins',
    role: 'VP of Engineering',
    company: 'Finova Cloud',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    rating: 5,
    comment:
      'The AI risk engine flagged a major budget gap before we even hired. It saved us 3 weeks of scope creep and thousands of dollars in delays.',
    projectCategory: 'Cloud Architecture & Migration',
    date: 'August 2026',
    verified: true,
  },
  {
    id: 'rev_3',
    name: 'Vikramaditya Sharma',
    role: 'Lead Architect',
    company: 'Nexus Labs',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    rating: 5,
    comment:
      'The 90/10 automatic resolution protocol gave both our team and the contractor absolute clarity. Best trust-first platform on the market.',
    projectCategory: 'Web3 & Payment Gateway',
    date: 'July 2026',
    verified: true,
  },
  {
    id: 'rev_4',
    name: 'Elena Rostova',
    role: 'Product Lead',
    company: 'HealthPulse Tech',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    rating: 5,
    comment:
      'Milestone custody makes managing enterprise software deliverables painless. No endless email arguments or delayed payouts.',
    projectCategory: 'Telehealth Mobile Dashboard',
    date: 'July 2026',
    verified: true,
  },
  {
    id: 'rev_5',
    name: 'Rohan Kulkarni',
    role: 'CTO',
    company: 'Quantum Logistics',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    rating: 5,
    comment:
      'The interactive demo inspection before fund unlock is brilliant. We only released milestone funds after testing full functionality.',
    projectCategory: 'Real-time Supply Chain App',
    date: 'June 2026',
    verified: true,
  },
  {
    id: 'rev_6',
    name: 'Priya Sundaram',
    role: 'Founder',
    company: 'EduLearn Interactive',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    rating: 5,
    comment:
      'Extremely sleek UI, cryptographically safe vault custody, and responsive governance. KEYStone is our go-to platform for every new project.',
    projectCategory: 'EdTech Web Application',
    date: 'June 2026',
    verified: true,
  },
];

export const LandingPage: React.FC = () => {
  const [reviews, setReviews] = useState<ClientReview[]>(INITIAL_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New review form state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [projectCategory, setProjectCategory] = useState('Web Development');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;

    const newRev: ClientReview = {
      id: `rev_${Date.now()}`,
      name,
      role: role || 'Client',
      company: company || 'Verified Enterprise',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      rating,
      comment,
      projectCategory,
      date: 'Just now',
      verified: true,
    };

    setReviews([newRev, ...reviews]);
    setIsModalOpen(false);

    // Reset form
    setName('');
    setRole('');
    setCompany('');
    setComment('');
  };

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
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            KEYStone<sup className="text-xs">®</sup>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <Link to="/" className="relative py-1 text-sm font-medium text-[hsl(var(--foreground))] transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-blue-500 after:to-indigo-500">
              Home
            </Link>
            <Link
              to="/how-it-works"
              className="relative py-1 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-blue-500 after:to-indigo-500 hover:after:w-full after:transition-all after:duration-300"
            >
              How It Works
            </Link>
            <Link
              to="/security"
              className="relative py-1 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-blue-500 after:to-indigo-500 hover:after:w-full after:transition-all after:duration-300"
            >
              Security
            </Link>
            <a
              href="mailto:support@keystone.demo"
              className="relative py-1 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-blue-500 after:to-indigo-500 hover:after:w-full after:transition-all after:duration-300"
            >
              Reach Us
            </a>
          </div>

          <Link
            to="/register?role=client"
            className="liquid-glass rounded-full px-6 py-2.5 text-sm text-[hsl(var(--foreground))] transition-transform duration-200 hover:scale-[1.03]"
          >
            <span className="relative z-10">Start a Project</span>
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
          <span className="relative z-10">Start a Project</span>
        </Link>
        </div>
      </section>

      {/* ================= SATISFIED CLIENTS & REVIEWS SECTION ================= */}
      <section id="reviews" className="relative py-24 px-6 bg-slate-950 border-t border-slate-800/80">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-16">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>4.98 / 5 Rating • 1,400+ Verified Escrow Milestones</span>
            </div>

            <h2
              className="text-4xl sm:text-5xl font-black tracking-tight text-white"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              What Our Satisfied Clients Say
            </h2>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Read how founders, product leaders, and enterprise clients use KEYStone's zero-risk escrow protocol to hire top builders with total financial safety.
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              Write a Client Review
            </button>
          </div>

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-6 transition-all hover:-translate-y-1 group"
              >
                <div className="space-y-4">
                  {/* Top Bar: Rating & Verified Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Client
                      </span>
                    )}
                  </div>

                  {/* Review Quote */}
                  <p className="text-slate-300 text-sm leading-relaxed italic relative">
                    <Quote className="w-6 h-6 text-slate-800 absolute -top-2 -left-2 -z-10 group-hover:text-blue-600/20 transition-colors" />
                    "{rev.comment}"
                  </p>
                </div>

                {/* Bottom Details & Author Profile */}
                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                      {rev.projectCategory}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {rev.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{rev.name}</h4>
                      <p className="text-xs text-slate-400 truncate">
                        {rev.role} • <span className="text-slate-300 font-semibold">{rev.company}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Guarantee Banner */}
          <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Escrow Protection Protocol</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Ready to experience zero-risk project delivery?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Join hundreds of satisfied clients who build faster, safer, and with cryptographically guaranteed payouts.
              </p>
            </div>

            <Link
              to="/register?role=client"
              className="liquid-glass shrink-0 rounded-full px-8 py-4 text-sm font-bold text-white shadow-xl hover:scale-105 transition-all"
            >
              Start Your Protected Project →
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SUBMIT REVIEW MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>KEYStone Client Voice</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Share Your Review</h3>
              <p className="text-xs text-slate-400">
                Help other clients and builders by sharing your project experience.
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Role / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Founder & CTO"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Innovations"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Project Category</label>
                  <select
                    value={projectCategory}
                    onChange={(e) => setProjectCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-blue-500"
                  >
                    <option>Web Development</option>
                    <option>Mobile App</option>
                    <option>AI Platform</option>
                    <option>UI/UX Design</option>
                    <option>Cloud Infrastructure</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Rating</label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 ml-2 font-bold">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Your Review *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us how KEYStone helped protect your project and deliver results..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
