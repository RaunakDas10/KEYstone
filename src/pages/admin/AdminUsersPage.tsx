import React from 'react';
import { Users, Award, ShieldCheck } from 'lucide-react';
import { SEED_USERS } from '../../mock/seedData';
import { Badge } from '../../components/ui/Badge';

export const AdminUsersPage: React.FC = () => {
  const userList = Object.values(SEED_USERS);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
          <Users className="w-8 h-8 text-blue-400" />
          Platform User Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">Audit verified clients, freelancers, and admin governance accounts.</p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase text-[10px] font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Trust Score</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {userList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-850">
                  <td className="p-4 flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-xl object-cover border border-slate-700" />
                    <div>
                      <div className="font-bold text-white text-sm">{u.name}</div>
                      <div className="text-slate-400 text-[11px]">{u.email}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold uppercase tracking-wider text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-400">
                    {u.trustScore ? `${u.trustScore} / 100` : 'N/A'}
                  </td>
                  <td className="p-4">
                    <Badge variant="emerald" icon={<ShieldCheck className="w-3 h-3" />}>
                      Verified
                    </Badge>
                  </td>
                  <td className="p-4 text-slate-400 font-mono">{u.joinedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
