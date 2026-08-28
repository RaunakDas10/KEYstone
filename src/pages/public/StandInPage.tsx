import React from 'react';
import { Construction, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const StandInPage: React.FC = () => <div className="min-h-[70vh] flex items-center justify-center px-4"><div className="max-w-lg text-center space-y-5"><div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto"><Construction className="w-8 h-8" /></div><h1 className="text-3xl font-black text-white">Workspace coming online</h1><p className="text-sm text-slate-400 leading-relaxed">This KEYStone area is reserved for the next workflow release. Your custody and audit records remain available from the dashboard.</p><Link to="/"><Button rightIcon={<ArrowRight className="w-4 h-4" />}>Return home</Button></Link></div></div>;
