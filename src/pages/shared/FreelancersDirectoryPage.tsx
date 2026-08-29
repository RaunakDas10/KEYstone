import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Award, ArrowRight } from 'lucide-react';
import { SEED_FREELANCERS } from '../../mock/seedData';
import { Button } from '../../components/ui/Button';

export const FreelancersDirectoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('cat') || 'All';
  const initialQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const categories = ['All', 'Web Development', 'Mobile Apps', 'AI & Data Science', 'UI/UX Design'];

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All') {
      newParams.delete('cat');
    } else {
      newParams.set('cat', category);
    }
    setSearchParams(newParams);
  };

  const filteredFreelancers = useMemo(() => {
    return SEED_FREELANCERS.filter((freelancer) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        freelancer.name.toLowerCase().includes(q) ||
        freelancer.title?.toLowerCase().includes(q) ||
        freelancer.skills?.some((s) => s.toLowerCase().includes(q)) ||
        freelancer.bio?.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'All' ||
        (selectedCategory === 'Web Development' &&
          freelancer.skills?.some((s) =>
            ['React', 'TypeScript', 'Node.js', 'Next.js', 'GraphQL', 'Tailwind CSS'].includes(s)
          )) ||
        (selectedCategory === 'Mobile Apps' &&
          freelancer.skills?.some((s) => ['React Native', 'iOS', 'Android', 'Flutter'].includes(s))) ||
        (selectedCategory === 'AI & Data Science' &&
          freelancer.skills?.some((s) =>
            ['Python', 'FastAPI', 'PyTorch', 'OpenAI API', 'Machine Learning'].includes(s)
          )) ||
        (selectedCategory === 'UI/UX Design' &&
          freelancer.skills?.some((s) => ['UI/UX', 'Figma', 'Design Systems', 'Tailwind CSS'].includes(s)));

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="bg-[#030712] text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Search & Category Header (Matching Doodle / Keystone Style) */}
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="What do you need built? Search by skill, title, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0b1120] border border-slate-800 text-white placeholder-slate-500 rounded-2xl pl-13 pr-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm shadow-xl transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-[#0b1120] text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Freelancer Profiles Grid (3 Columns matching UI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFreelancers.map((freelancer) => (
            <div
              key={freelancer.id}
              className="bg-[#0b1120] border border-slate-800/90 hover:border-slate-700 rounded-3xl p-6 shadow-2xl transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Profile Header */}
                <div className="flex items-start gap-4">
                  <img
                    src={freelancer.avatar}
                    alt={freelancer.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-base flex items-center gap-1.5 truncate">
                      {freelancer.name}
                      {freelancer.verified && (
                        <Award className="w-4 h-4 text-emerald-400 shrink-0 fill-emerald-500/20" />
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{freelancer.title}</p>
                  </div>
                </div>

                {/* Keystone Score Box */}
                <div className="bg-[#030712] p-3.5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 font-mono text-xs">
                      {freelancer.trustScore || 98}
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        KEYSTONE SCORE
                      </span>
                      <span className="text-xs font-semibold text-emerald-400">Excellent Integrity</span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider">On-Time Rate</span>
                    <span className="font-bold text-white font-mono">{freelancer.onTimeRate || 96}%</span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{freelancer.bio}</p>

                {/* Skills Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {freelancer.skills?.map((skill) => (
                    <span
                      key={skill}
                      className="bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-medium px-2.5 py-1 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-5 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    STARTING RATE
                  </span>
                  <span className="text-base font-extrabold text-white font-mono">
                    ₹{freelancer.hourlyRate?.toLocaleString() || '2,500'}/hr
                  </span>
                </div>

                <Link to={`/freelancers/${freelancer.id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredFreelancers.length === 0 && (
          <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
            <p className="text-base font-semibold text-white">No freelancers matched your criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your filters or searching for different keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancersDirectoryPage;
