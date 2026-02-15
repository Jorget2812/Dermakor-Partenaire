import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Users,
    Award,
    ArrowUpRight,
    Clock,
    Zap,
    Target,
    ChevronRight,
    ShieldCheck
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { motion } from 'framer-motion';

const AdminStrategicOverview: React.FC = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        eliteCount: 0,
        proCount: 0,
        baseCount: 0,
        avgOrderValue: 0,
        projection: 0
    });
    const [partners, setPartners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const GLOBAL_GOAL = 100000;

    useEffect(() => {
        const fetchGlobalStats = async () => {
            try {
                // Fetch all orders from this month
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

                const { data: orders } = await supabase
                    .from('orders')
                    .select('total_amount, partner_id')
                    .gte('created_at', startOfMonth);

                const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

                // Group by partner to count tiers
                const partnerSpends: Record<string, number> = {};
                orders?.forEach(o => {
                    partnerSpends[o.partner_id] = (partnerSpends[o.partner_id] || 0) + Number(o.total_amount);
                });

                let elite = 0, pro = 0, base = 0;
                Object.values(partnerSpends).forEach(spend => {
                    if (spend >= 4000) elite++;
                    else if (spend >= 2000) pro++;
                    else if (spend >= 800) base++;
                });

                // Projection logic (linear)
                const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                const currentDay = now.getDate();
                const projection = (totalRevenue / currentDay) * daysInMonth;

                setStats({
                    totalRevenue,
                    eliteCount: elite,
                    proCount: pro,
                    baseCount: base,
                    avgOrderValue: totalRevenue / (orders?.length || 1),
                    projection
                });

                // Fetch top partners for ranking
                const { data: partnerData } = await supabase
                    .from('partner_users')
                    .select('id, company_name, contact_name, email');

                const rankedPartners = partnerData?.map(p => ({
                    ...p,
                    currentSpend: partnerSpends[p.id] || 0,
                    tier: partnerSpends[p.id] >= 4000 ? 'ELITE' : partnerSpends[p.id] >= 2000 ? 'PRO' : partnerSpends[p.id] >= 800 ? 'BASE' : 'STANDARD'
                })).sort((a, b) => b.currentSpend - a.currentSpend) || [];

                setPartners(rankedPartners);

            } catch (err) {
                console.error('AdminStrategicOverview: Error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGlobalStats();
    }, []);

    const progressValue = Math.min((stats.totalRevenue / GLOBAL_GOAL) * 100, 100);

    if (isLoading) return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-derma-gold"></div></div>;

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-10 animate-fade-in bg-white min-h-screen">
            {/* Executive Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-derma-border pb-10">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-[4px] text-derma-gold mb-3 block">Distribution Intelligence</span>
                    <h1 className="font-serif text-5xl text-derma-black leading-tight">Vision Stratégique Suisse</h1>
                    <p className="text-derma-text-muted mt-3 font-light text-lg">Objectif Target: 100,000 CHF / mois</p>
                </div>
                <div className="bg-derma-cream p-4 border border-derma-border rounded-sm flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-derma-text-muted uppercase tracking-widest mb-1">Projection Finale</p>
                        <p className="font-serif text-xl text-derma-black">CHF {stats.projection.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="h-10 w-px bg-derma-border"></div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-derma-text-muted uppercase tracking-widest mb-1">Taux de Réussite</p>
                        <p className="font-serif text-xl text-derma-gold">{(stats.projection / GLOBAL_GOAL * 100).toFixed(1)}%</p>
                    </div>
                </div>
            </div>

            {/* Global Progress Bar Section */}
            <div className="bg-derma-blue-executive p-10 rounded-sm text-white shadow-deep overflow-hidden relative">
                <Target className="absolute -top-10 -right-10 text-white/5 w-64 h-64" />
                <div className="relative z-10 space-y-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-[3px] text-derma-gold-muted mb-2">Performance du Réseau</h3>
                            <p className="text-4xl font-serif">CHF {stats.totalRevenue.toLocaleString()} <span className="text-xl text-blue-200/50 font-light">encaissés ce mois</span></p>
                        </div>
                        <div className="text-right">
                            <span className="text-5xl font-serif text-derma-gold">{progressValue.toFixed(0)}%</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressValue}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-derma-gold shadow-[0_0_20px_rgba(192,167,106,0.5)]"
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-blue-100/60">
                            <span>0 CHF</span>
                            <span>Points de contrôle: 50k CHF</span>
                            <span>Target: 100k CHF</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ecosystem KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-derma-border p-6 rounded-sm shadow-premium">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-derma-gold/5 rounded-sm">
                            <Award size={18} className="text-derma-gold" />
                        </div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[1.5px] text-derma-text">Elite 20 Circle</h4>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="font-serif text-3xl text-derma-black">{stats.eliteCount}</p>
                        <p className="text-xs text-derma-text-muted">/ 20 places</p>
                    </div>
                    <div className="mt-3 h-1 w-full bg-derma-border rounded-full overflow-hidden">
                        <div className="h-full bg-derma-gold" style={{ width: `${(stats.eliteCount / 20) * 100}%` }}></div>
                    </div>
                </div>

                <div className="bg-white border border-derma-border p-6 rounded-sm shadow-premium">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-sm">
                            <Zap size={18} className="text-blue-600" />
                        </div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[1.5px] text-derma-text">Partenaires Pro</h4>
                    </div>
                    <p className="font-serif text-3xl text-derma-black">{stats.proCount}</p>
                    <p className="text-[10px] text-derma-text-muted tracking-wide mt-1">Potentiel Elite: {stats.proCount} membres</p>
                </div>

                <div className="bg-white border border-derma-border p-6 rounded-sm shadow-premium">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-derma-cream rounded-sm">
                            <Users size={18} className="text-derma-blue-executive" />
                        </div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[1.5px] text-derma-text">Base Installée</h4>
                    </div>
                    <p className="font-serif text-3xl text-derma-black">{stats.baseCount}</p>
                    <p className="text-[10px] text-derma-text-muted tracking-wide mt-1">Volume 800-1999 CHF</p>
                </div>

                <div className="bg-white border border-derma-border p-6 rounded-sm shadow-premium">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-50 rounded-sm">
                            <ArrowUpRight size={18} className="text-green-600" />
                        </div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[1.5px] text-derma-text">Panier Moyen</h4>
                    </div>
                    <p className="font-serif text-3xl text-derma-black">CHF {stats.avgOrderValue.toFixed(0)}</p>
                    <p className="text-[10px] text-derma-text-muted tracking-wide mt-1">Optimisation requise: +12%</p>
                </div>
            </div>

            {/* Top Performance Ranking Table */}
            <div className="bg-derma-cream border border-derma-border p-10 rounded-sm shadow-premium">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <BarChart3 size={24} className="text-derma-gold" />
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-derma-black">Classement National</h3>
                            <p className="text-sm font-light text-derma-text-muted">Top performeurs du réseau KRX Aesthetics Suisse.</p>
                        </div>
                    </div>
                    <button className="text-[10px] font-bold uppercase tracking-widest text-derma-gold border border-derma-gold/30 px-6 py-2 hover:bg-derma-gold hover:text-white transition-all">
                        Exporter Strategic Data
                    </button>
                </div>

                <div className="bg-white rounded-sm overflow-hidden border border-derma-border">
                    <table className="w-full text-left">
                        <thead className="bg-derma-cream/50 border-b border-derma-border">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-derma-text-muted">Rang</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-derma-text-muted">Partenaire</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-derma-text-muted">Tier</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-derma-text-muted text-right">Volume Mensuel</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-derma-border">
                            {partners.slice(0, 10).map((p, index) => (
                                <tr key={p.id} className="hover:bg-derma-cream/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <span className={`text-sm font-serif ${index < 3 ? 'text-derma-gold font-bold italic' : 'text-derma-text-muted'}`}>
                                            #{index + 1}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div>
                                            <p className="text-sm font-medium text-derma-black group-hover:text-derma-gold transition-colors">{p.company_name}</p>
                                            <p className="text-[10px] text-derma-text-muted font-light">{p.contact_name}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            {p.tier === 'ELITE' && <ShieldCheck size={12} className="text-derma-gold" />}
                                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${p.tier === 'ELITE' ? 'bg-derma-gold text-white shadow-sm' :
                                                    p.tier === 'PRO' ? 'bg-blue-50 text-blue-600' :
                                                        'bg-gray-50 text-gray-500'
                                                }`}>
                                                {p.tier}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <p className="text-sm font-bold text-derma-black">CHF {p.currentSpend.toLocaleString()}</p>
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <div className="w-16 h-1 bg-derma-border rounded-full overflow-hidden">
                                                <div className="h-full bg-derma-gold" style={{ width: `${Math.min((p.currentSpend / 5000) * 100, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminStrategicOverview;
