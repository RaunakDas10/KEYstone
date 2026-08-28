import React from 'react';
import { History } from 'lucide-react';
import { useLedgerStore } from '../../store';
import { LedgerTable } from '../../components/common/LedgerTable';

export const AdminLedgerPage: React.FC = () => {
  const { entries } = useLedgerStore();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <History className="w-8 h-8 text-blue-400" />
            Append-Only Audit Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">Cryptographically verifiable sequence of all financial and governance events.</p>
        </div>
      </div>

      <LedgerTable entries={entries} />
    </div>
  );
};
