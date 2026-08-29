import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShieldCheck, Award, Star, Clock, Filter, ArrowRight } from 'lucide-react';
import { SEED_FREELANCERS, SEED_PORTFOLIO } from '../../mock/seedData';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useProjectStore } from '../../store';

export const MarketplacePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchParams] = useSearchParams();
  const projectsOnly = searchParams.get('view') === 'projects';
  const projects = useProjectStore((state) => state.projects);
  const openProjects = projects.filter((project) => project.access === 'open' && project.status === 'selection_pending' && !project.freelancerId);

  const freelancers = SEED_FREELANCERS;

  const categories = ['All', 'Web Development', 'Mobile Apps', 'AI & Data Science', 'UI/UX Design'];

  const filteredFreelancers = freelancers.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.skills?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="blue" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Verified Talent Network
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Find Trusted Freelance Engineers
          </h1>
          <p className="text-sm text-slate-400 mt-3">
            Every freelancer is backed by transparent KEYStone Trust Scores, verified delivery metrics, and custody-protected contracts.
          </p>
        </div>

        <section className="mb-12">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div><span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Freelancer opportunities</span><h2 className="text-2xl font-black text-white mt-1">Open projects</h2><p className="text-xs text-slate-400 mt-1">Submit your freelancer profile before the deadline. Work unlocks only after the client selects an applicant.</p></div>
            <span className="text-xs font-mono text-slate-400">{openProjects.length} available</span>
          </div>
          {openProjects.length ? <div className="grid md:grid-cols-2 gap-4">{openProjects.map((project) => <div key={project.id} className="bg-slate-900/90 border border-emerald-500/20 rounded-2xl p-5"><div className="flex justify-between gap-3"><div><span className="text-[10px] uppercase font-bold text-emerald-400">{project.category}</span><h3 className="text-base font-bold text-white mt-1">{project.title}</h3></div><span className="text-sm font-mono font-bold text-white">₹{project.budget.toLocaleString()}</span></div><p className="text-xs text-slate-400 mt-3 line-clamp-2">{project.description}</p><div className="flex flex-wrap gap-1.5 mt-4">{project.skills.map((skill) => <span key={skill} className="text-[10px] bg-slate-950 border border-slate-800 text-slate-300 px-2 py-1 rounded">{skill}</span>)}</div><div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800"><span className="text-[11px] text-slate-500">Apply by: {project.applicationDeadline || 'Not set'}</span><Link to={`/freelancer/projects/${project.id}`}><Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>View & apply</Button></Link></div></div>)}</div> : <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500">No open projects are published yet.</div>}
        </section>

        {projectsOnly ? <section className="max-w-4xl mx-auto"><div className="grid md:grid-cols-2 gap-4">{openProjects.map((project) => <div key={project.id} className="bg-slate-900/90 border border-emerald-500/20 rounded-2xl p-5"><span className="text-[10px] uppercase font-bold text-emerald-400">{project.category}</span><h3 className="text-base font-bold text-white mt-1">{project.title}</h3><p className="text-xs text-slate-400 mt-3">{project.description}</p><p className="text-[11px] text-emerald-300 mt-3">Profile deadline: {project.applicationDeadline || 'Not set'}</p><p className="text-sm font-mono font-bold text-white mt-4">₹{project.budget.toLocaleString()}</p><Link to={`/freelancer/projects/${project.id}`}><Button variant="outline" size="sm" className="mt-4" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>View & apply</Button></Link></div>)}</div>{!openProjects.length && <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500">No new open projects are available.</div>}</section> : <>
        {/* Search Bar & Categories */}
        <div className="max-w-4xl mx-auto mb-12 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="What do you need built? Search by skill, title, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm shadow-xl transition-all"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Freelancers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFreelancers.map((freelancer) => (
            <div
              key={freelancer.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Profile Top */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={freelancer.avatar}
                      alt={freelancer.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                    />
                    <div>
                      <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                        {freelancer.name}
                        {freelancer.verified && <Award className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1">{freelancer.title}</p>
                    </div>
                  </div>
                </div>

                {/* Trust Score Box */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 font-mono text-sm">
                      {freelancer.trustScore}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">KEYStone Score</span>
                      <span className="text-xs font-semibold text-emerald-400">Excellent Integrity</span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block text-[10px]">On-Time Rate</span>
                    <span className="font-bold text-white font-mono">{freelancer.onTimeRate}%</span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">{freelancer.bio}</p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {freelancer.skills?.map((skill) => (
                    <span key={skill} className="bg-slate-800 text-slate-300 text-[11px] font-medium px-2.5 py-1 rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Starting Rate</span>
                  <span className="text-base font-extrabold text-white font-mono">₹{freelancer.hourlyRate?.toLocaleString()}/hr</span>
                </div>

                <Link to={`/freelancers/${freelancer.id}`}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div></>}
      </div>
    </div>
  );
};
