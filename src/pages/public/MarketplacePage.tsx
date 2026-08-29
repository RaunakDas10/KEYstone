import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShieldCheck, ArrowRight, Clock, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useProjectStore } from '../../store';

export const MarketplacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('cat') || 'All';
  const initialQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const projects = useProjectStore((state) => state.projects);
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

  const openProjects = useMemo(() => {
    return projects.filter((project) => {
      // Must be open project
      const isOpen = project.access === 'open' || project.status === 'selection_pending' || !project.freelancerId;
      if (!isOpen) return false;

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        project.category.toLowerCase().includes(q) ||
        project.skills.some((s) => s.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'All' ||
        project.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (selectedCategory === 'Web Development' && project.category === 'Web Development') ||
        (selectedCategory === 'Mobile Apps' && project.category === 'Mobile Apps') ||
        (selectedCategory === 'AI & Data Science' && project.category === 'AI & Data Science') ||
        (selectedCategory === 'UI/UX Design' && project.category === 'UI/UX Design');

      return matchesSearch && matchesCategory;
    });
  }, [projects, searchTerm, selectedCategory]);

  return (
    <div className="bg-[#030712] text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="blue" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Verified Escrow Marketplace
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Find Open Freelance Projects
          </h1>
          <p className="text-sm text-slate-400">
            Submit your freelancer profile before the deadline. Work unlocks securely once the client selects an applicant.
          </p>
        </div>

        {/* Search Bar & Categories Sorter */}
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search open projects by title, skill, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0b1120] border border-slate-800 text-white placeholder-slate-500 rounded-2xl pl-13 pr-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm shadow-xl transition-all"
            />
          </div>

          {/* Category Pills */}
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

        {/* Open Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest block">
                Freelancer Opportunities
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">Open Projects</h2>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              {openProjects.length} available
            </span>
          </div>

          {openProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {openProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-[#0b1120] border border-slate-800/90 hover:border-slate-700 rounded-3xl p-6 shadow-2xl transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full inline-block">
                          {project.category}
                        </span>
                        <h3 className="text-lg font-bold text-white leading-snug">{project.title}</h3>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Budget</span>
                        <span className="text-lg font-mono font-black text-white">
                          ₹{project.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{project.description}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Apply by: <strong className="text-slate-300 font-mono">{project.applicationDeadline || '2026-09-05'}</strong></span>
                    </div>

                    <Link to={`/freelancer/projects/${project.id}`}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        View & Apply
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-base font-semibold text-white">No open projects match your search</p>
              <p className="text-xs text-slate-500 mt-1">Try searching with different terms or select "All" categories.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
