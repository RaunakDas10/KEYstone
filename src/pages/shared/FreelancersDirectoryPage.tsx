import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Award, ArrowRight, Sparkles, LoaderCircle, X } from 'lucide-react';
import { SEED_FREELANCERS } from '../../mock/seedData';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store';
import { api } from '../../services/api';
import type { TalentRecommendation } from '../../types';

export const FreelancersDirectoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('cat') || 'All';
  const initialQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiResults, setAiResults] = useState<TalentRecommendation[] | null>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [aiUsed, setAiUsed] = useState(false);
  const [aiError, setAiError] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const currentUser = useAuthStore((state) => state.currentUser);
  const users = useAuthStore((state) => state.users);
  const fetchUsers = useAuthStore((state) => state.fetchUsers);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const categories = ['All', 'Web Development', 'Mobile Apps', 'AI & Data Science', 'UI/UX Design'];

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setAiResults(null);
    setAiError('');
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All') {
      newParams.delete('cat');
    } else {
      newParams.set('cat', category);
    }
    setSearchParams(newParams);
  };

  const directoryFreelancers = useMemo(() => {
    const byId = new Map(SEED_FREELANCERS.map((freelancer) => [freelancer.id, freelancer]));
    users
      .filter((user) => user.role === 'freelancer')
      .forEach((user) => byId.set(user.id, user));
    return [...byId.values()];
  }, [users]);

  const filteredFreelancers = useMemo(() => {
    return directoryFreelancers.filter((freelancer) => {
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
  }, [directoryFreelancers, searchTerm, selectedCategory]);

  const displayedFreelancers = aiResults ? aiResults.map((result) => result.freelancer) : filteredFreelancers;
  const recommendationById = new Map(aiResults?.map((result) => [result.freelancer.id, result]) || []);

  const runAiSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!isAiMode || !query || isAiSearching) return;

    setIsAiSearching(true);
    setAiError('');
    try {
      const response = await api.findTalentWithAI(query, currentUser.id);
      setAiResults(response.results);
      setAiSummary(response.summary);
      setAiUsed(response.aiUsed);
    } catch (error) {
      setAiResults(null);
      setAiError(error instanceof Error ? error.message : 'AI Mode could not find talent right now.');
    } finally {
      setIsAiSearching(false);
    }
  };

  const toggleAiMode = () => {
    setIsAiMode((enabled) => !enabled);
    setAiResults(null);
    setAiSummary('');
    setAiError('');
  };

  return (
    <div className="bg-[#030712] text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Search & Category Header (Matching Doodle / Keystone Style) */}
        <div className="max-w-4xl mx-auto space-y-4">
          <form onSubmit={runAiSearch} className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={isAiMode ? 'Describe what you want to build...' : 'What do you need built? Search by skill, title, or keyword...'}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setAiResults(null);
                setAiError('');
              }}
              className="w-full bg-[#0b1120] border border-slate-800 text-white placeholder-slate-500 rounded-2xl pl-13 pr-31 py-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm shadow-xl transition-all"
            />
            <button
              type="button"
              onClick={toggleAiMode}
              aria-pressed={isAiMode}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                isAiMode
                  ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Mode
            </button>
          </form>

          {isAiMode && (
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-blue-300 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-blue-100">Describe your goal in plain language, then press Enter.</p>
                <p className="text-[11px] text-blue-200/70 mt-0.5">Gemini will rank up to five verified freelancer profiles for the work you need.</p>
              </div>
              {isAiSearching && <LoaderCircle className="w-4 h-4 text-blue-300 animate-spin shrink-0" />}
            </div>
          )}

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

        {aiError && (
          <div className="max-w-4xl mx-auto rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 flex items-start gap-3 text-xs text-rose-100">
            <X className="w-4 h-4 text-rose-300 mt-0.5 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}

        {aiResults && (
          <div className="max-w-4xl mx-auto rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-100">
              <Sparkles className="w-4 h-4 text-violet-300" />
              {aiUsed ? 'AI-ranked talent matches' : 'Reliability-ranked talent matches'}
            </div>
            <p className="text-xs text-violet-100/75 mt-1">{aiSummary}</p>
          </div>
        )}

        {/* Freelancer Profiles Grid (3 Columns matching UI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedFreelancers.map((freelancer) => {
            const recommendation = recommendationById.get(freelancer.id);
            return (
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

                {recommendation && (
                  <div className="rounded-xl border border-violet-500/25 bg-violet-500/10 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-200">AI match</span>
                      <span className="text-xs font-black text-violet-200">{recommendation.matchScore}%</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-violet-100/80">{recommendation.matchReason}</p>
                  </div>
                )}

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
            );
          })}
        </div>

        {displayedFreelancers.length === 0 && (
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
