import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  RefreshCw,
  FileCheck,
  Shield,
  Layers,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FundLifecycleVisualizer } from '../../components/common/FundLifecycleVisualizer';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-blue-400 mb-6 shadow-lg shadow-blue-500/10">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Trust-Driven Freelance Protocol
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
            Freelancing, Without the{' '}
            <span className="text-gradient-primary">Trust Gap.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            KEYStone secures project funds, verifies work through checkpoints, and creates a transparent path from agreement to payout.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register?role=client">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Start a Project
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button size="lg" variant="outline">
                Find Work
              </Button>
            </Link>
          </div>

          {/* Hero Visualizer */}
          <div className="max-w-4xl mx-auto">
            <FundLifecycleVisualizer
              currentState="FROZEN"
              amountCustody={40000}
              amountFrozen={40000}
              amountWithdrawable={0}
              totalBudget={80000}
            />
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-16 max-w-5xl mx-auto text-left text-xs font-semibold text-slate-400 border-t border-slate-800/80 pt-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Funds secured upfront</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Transparent lifecycle</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Demo-first approval</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Automatic 90/10 rule</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400 shrink-0" />
              <span>7-Day auto-unlock</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: THE TRUST PROBLEM */}
      <section className="py-20 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">The Core Problem</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Traditional Freelancing Has a Broken Foundation.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Client Fear</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-3">"Will they actually deliver?"</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Clients fear depositing funds upfront only to receive unfinished, buggy work or suffer complete freelancer ghosting.
                </p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Freelancer Fear</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-3">"Will I actually get paid?"</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Freelancers fear spending weeks building software only for clients to request infinite revisions or refuse payout.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-950/80 to-indigo-950/80 border border-blue-500/40 rounded-2xl p-6 flex flex-col justify-between glow-blue">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">The KEYStone Solution</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-3">Both sides are protected.</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Funds are secured upfront in platform custody, frozen during checkpoint review, and released only upon working demo approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: HOW KEYSTONE WORKS (4 STEPS) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Platform Workflow</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            How KEYStone Guarantees Fairness in 4 Steps
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Secure Funds',
              desc: 'Client deposits 100% of project funds into KEYStone platform vault before work begins.',
              icon: ShieldCheck,
              color: 'text-blue-400',
            },
            {
              step: '02',
              title: 'Start Work',
              desc: 'Freelancer begins building immediately, knowing payment is already guaranteed and locked.',
              icon: Zap,
              color: 'text-purple-400',
            },
            {
              step: '03',
              title: 'Review Checkpoint',
              desc: 'Freelancer submits a working live demo link and codebase for milestone evaluation.',
              icon: FileCheck,
              color: 'text-amber-400',
            },
            {
              step: '04',
              title: 'Release Fairly',
              desc: 'Funds transition smoothly to Withdrawable state upon approval or follow strict 90/10 rules.',
              icon: CheckCircle2,
              color: 'text-emerald-400',
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative">
                <span className="text-4xl font-black text-slate-800 absolute top-4 right-4">{s.step}</span>
                <div className={`p-3 bg-slate-950 rounded-xl w-fit mb-4 border border-slate-800 ${s.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION: YOUR MONEY HAS A STATE (3 CARDS) */}
      <section className="py-20 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Financial Transparency</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Your Money Has a State
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              No hidden escrows or ambiguous pending payouts. Funds exist in 3 clear states.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-950 border border-blue-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  State 1
                </span>
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">IN CUSTODY</h3>
              <p className="text-xs font-semibold text-slate-400 mb-4">Funds Secured by Platform</p>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Client has deposited the project funds. Money is locked securely by KEYStone. Freelancer cannot withdraw it yet, protecting the client against premature payment while protecting the builder against ghosting.
              </p>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs font-mono text-blue-300">
                ₹50,000 • Status: In Custody
              </div>
            </div>

            <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  State 2
                </span>
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">FROZEN</h3>
              <p className="text-xs font-semibold text-slate-400 mb-4">Under Checkpoint Review</p>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                A milestone demo has been submitted. Funds associated with this checkpoint are temporarily frozen while the working demo is tested, approved, or processed via governance.
              </p>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs font-mono text-amber-300">
                ₹40,000 • Status: Frozen
              </div>
            </div>

            <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  State 3
                </span>
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">WITHDRAWABLE</h3>
              <p className="text-xs font-semibold text-slate-400 mb-4">Available for Payout</p>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Work has been successfully completed and approved. Funds become immediately withdrawable by the freelancer to their linked bank account or UPI wallet.
              </p>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300">
                ₹50,000 • Status: Withdrawable
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: BUILT-IN FAIRNESS (90/10 RULE) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-purple-500/30 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Automated Protection</span>
              <h2 className="text-3xl font-extrabold text-white mt-2 mb-4">
                Built-In Fairness: The 90/10 Resolution Rule
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                If a project fails to meet acceptance criteria at a predefined halfway checkpoint, KEYStone automatically applies the <strong>90/10 Rule</strong>:
              </p>

              <div className="space-y-3 mb-6 text-xs">
                <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <span className="font-mono font-bold text-emerald-400 text-base">90%</span>
                  <span className="text-slate-300">Returned immediately to the Client as a refund.</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <span className="font-mono font-bold text-amber-400 text-base">10%</span>
                  <span className="text-slate-300">Compensates the Builder for verified effort & discovery time.</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                This predefined platform rule compensates partial effort while protecting 90% of client capital.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white">Example Calculation (₹50,000 Checkpoint)</h4>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between p-2 rounded bg-slate-900 text-slate-300">
                  <span>Total Checkpoint Budget:</span>
                  <span className="font-bold text-white">₹50,000</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  <span>Client Refund (90%):</span>
                  <span className="font-bold">₹45,000</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  <span>Builder Fee (10%):</span>
                  <span className="font-bold">₹5,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 text-center bg-gradient-navy border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Build. Deliver. Get Paid.
          </h2>
          <p className="text-slate-400 text-base mb-8 max-w-xl mx-auto">
            Join the trust-first freelance marketplace that eliminates payment risk for clients and builders alike.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register?role=client">
              <Button size="lg" variant="primary">
                Start a Project
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button size="lg" variant="outline">
                Find Freelance Work
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
