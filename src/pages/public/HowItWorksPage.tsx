import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, RefreshCw, Clock, ArrowRight } from 'lucide-react';
import { FundLifecycleVisualizer } from '../../components/common/FundLifecycleVisualizer';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { TrustScoreCard } from '../../components/common/TrustScoreCard';
import { SEED_USERS } from '../../mock/seedData';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Platform Protocol
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            How KEYStone Works
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminating payment anxiety for freelancers and project risk for clients through an automated 3-State fund lifecycle.
          </p>
        </div>

        <section className="space-y-4">
          <div><span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Trust scoring</span><h2 className="text-2xl font-black text-white mt-1">Proof becomes reputation</h2><p className="text-sm text-slate-400 mt-2 max-w-2xl">Each score is calculated from delivery timing, completed contracts, verified checkpoint submissions, and dispute rate. Payment activity and audit events keep the score explainable.</p></div>
          <TrustScoreCard user={SEED_USERS.freelancer} />
        </section>

        {/* Visualizer Showcase */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <FundLifecycleVisualizer
            currentState="IN_CUSTODY"
            amountCustody={50000}
            amountFrozen={0}
            amountWithdrawable={0}
            totalBudget={50000}
          />
        </div>

        {/* Deep Dive Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              1
            </div>
            <h3 className="text-lg font-bold text-white">Full Custody Deposit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Before work begins, 100% of agreed funds are deposited into KEYStone Escrow. Money is locked securely by the platform. The freelancer receives instant proof of funding.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              2
            </div>
            <h3 className="text-lg font-bold text-white">Demo-First Evaluation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instead of static screenshots or textual updates, freelancers submit a live interactive working demo URL and codebase. Funds associated with the checkpoint freeze automatically during review.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
              3
            </div>
            <h3 className="text-lg font-bold text-white">90/10 Automatic Resolution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If a project fails at a defined halfway milestone, 90% of funds return to the client while 10% compensates the builder for partial effort, preventing all-or-nothing conflicts.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              4
            </div>
            <h3 className="text-lg font-bold text-white">7-Day Inactivity Guarantee</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If a client goes silent after a working demo is submitted, funds automatically unlock after 7 days according to platform rules so freelancers are never held hostage.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <Link to="/register">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
