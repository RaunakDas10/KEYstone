import React from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">KEYStone</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            Trust-driven freelance marketplace. Build with confidence, pay with proof.
          </p>
          <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-[11px] text-slate-300">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Designed by <span className="font-bold text-white">AstroPhoenix</span>
          </div>
        </div>

        {/* Product */}
        <div>
          <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Product Protocol</h5>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/how-it-works" className="hover:text-blue-400">
                3-State Fund Lifecycle
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-blue-400">
                90/10 Fair Resolution
              </Link>
            </li>
            <li>
              <Link to="/security" className="hover:text-blue-400">
                7-Day Inactivity Protection
              </Link>
            </li>
            <li>
              <Link to="/marketplace" className="hover:text-blue-400">
                Talent Marketplace
              </Link>
            </li>
          </ul>
        </div>

        {/* Platform Rules */}
        <div>
          <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Governance & Rules</h5>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/security" className="hover:text-blue-400">
                Platform Vault Security
              </Link>
            </li>
            <li>
              <Link to="/security" className="hover:text-blue-400">
                Append-Only Ledger
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-blue-400">
                Checkpoint Review Rules
              </Link>
            </li>
            <li>
              <Link to="/security" className="hover:text-blue-400">
                Dispute Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Trust Badges */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-white uppercase tracking-wider">Financial Guarantees</h5>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 text-[11px]">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              ✓ Funds Secured Upfront
            </div>
            <div className="flex items-center gap-2 text-blue-400 font-semibold">
              ✓ Demo-First Approval
            </div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold">
              ✓ Immutable Event Ledger
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
        <p>© 2026 KEYStone Platform by AstroPhoenix. All rights reserved.</p>
        <div className="flex gap-4 mt-2 sm:mt-0 text-slate-400">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Security Whitepaper</span>
        </div>
      </div>
    </footer>
  );
};
