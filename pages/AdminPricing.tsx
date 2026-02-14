import React, { useState, useEffect } from 'react';
import { Product, UserTier } from '../types';
import { Search, Info, TrendingUp, DollarSign, Percent, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { calculatePriceFromMarkup } from '../utils/finance';

const AdminPricing: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'GLOBAL' | 'CATEGORIES' | 'INDIVIDUAL'>('GLOBAL');

    // Scaling Simulator State
    const [partnersStd, setPartnersStd] = useState(10);
    const [partnersPrem, setPartnersPrem] = useState(5);
    const [avgTicket, setAvgTicket] = useState(1200);

    // Global Margins
    const [stdMargin, setStdMargin] = useState(50);
    const [premMargin, setPremMargin] = useState(70);

    // Category Margins State
    const [categoryMargins, setCategoryMargins] = useState<Record<string, { std: number, prem: number }>>({});

    // Simulation for Margins
    const [simStd, setSimStd] = useState(50);
    const [simPrem, setSimPrem] = useState(70);
    const [isSimulating, setIsSimulating] = useState(false);

    const fetchPricingData = async () => {
        setIsLoading(true);
        try {
            const { data: productsData } = await supabase.from('products').select('*').order('name');
            const { data: settingsData } = await supabase.from('site_settings').select('*').eq('key', 'global_margins').single();
            const { data: catSettings } = await supabase.from('site_settings').select('*').eq('key', 'category_margins').single();

            if (settingsData) {
                setStdMargin(settingsData.value.standard);
                setPremMargin(settingsData.value.premium);
                setSimStd(settingsData.value.standard);
                setSimPrem(settingsData.value.premium);
            }
            if (catSettings) {
                setCategoryMargins(catSettings.value);
            }
            setProducts(productsData || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPricingData();
    }, []);

    const categories = Array.from(new Set(products.map(p => p.category || 'Otros'))).sort();

    const handleApplyStrategy = async () => {
        setIsSaving(true);
        try {
            await supabase.from('site_settings').upsert({
                key: 'global_margins',
                value: { standard: simStd, premium: simPrem }
            });

            await supabase.from('site_settings').upsert({
                key: 'category_margins',
                value: categoryMargins
            });

            const updates = products.map(p => {
                const cost = Number(p.cost_price || 0);
                const catMargin = categoryMargins[p.category || 'Otros'] || { std: simStd, prem: simPrem };

                const finalStdMargin = catMargin.std || simStd;
                const finalPremMargin = catMargin.prem || simPrem;

                const stdPrice = calculatePriceFromMarkup(cost, finalStdMargin);
                const premPrice = calculatePriceFromMarkup(cost, finalPremMargin);

                return supabase.from('products').update({
                    price: stdPrice,
                    pricing: {
                        basePrice: cost,
                        standard: { type: 'FIXED', value: stdPrice, margin: finalStdMargin },
                        premium: { type: 'FIXED', value: premPrice, margin: finalPremMargin }
                    }
                }).eq('id', p.id);
            });

            await Promise.all(updates);
            setStdMargin(simStd);
            setPremMargin(simPrem);
            setIsSimulating(false);
            alert("Stratégie de prix appliquée à tout le catalogue.");
            await fetchPricingData();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateCostPrice = async (id: string, newCostPrice: number) => {
        try {
            const { error } = await supabase.from('products').update({ cost_price: newCostPrice }).eq('id', id);
            if (error) throw error;
            setProducts(products.map(p => p.id === id ? { ...p, cost_price: newCostPrice } : p));
        } catch (err) { console.error(err); }
    };

    // Advanced Metrics
    const projectedMonthlyRevenue = (partnersStd * avgTicket) + (partnersPrem * (avgTicket * 1.5));
    const projectedMonthlyProfit = projectedMonthlyRevenue * (simStd / 100);
    const scalingTarget = 100000;
    const scalingCoverage = Math.min((projectedMonthlyRevenue / scalingTarget) * 100, 100);

    return (
        <div className="space-y-10">
            {/* Header & Simulator */}
            <div className="bg-white border border-derma-border rounded-2xl p-10 shadow-premium relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row gap-12">
                    <div className="flex-1 space-y-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="font-oswald text-3xl uppercase tracking-tighter text-derma-text">Intelligence de Prix</h1>
                                <p className="text-[10px] text-derma-text-muted font-black uppercase tracking-[0.3em] mt-1 opacity-60">Stratégie de Marges & Escalade</p>
                            </div>
                            <div className="flex bg-derma-bg/50 p-1 rounded-xl border border-derma-border">
                                {['GLOBAL', 'CATEGORIES', 'INDIVIDUAL'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setActiveTab(t as any)}
                                        className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-luxury
                                            ${activeTab === t ? 'bg-white text-derma-blue shadow-sm' : 'text-derma-text-muted hover:text-derma-text'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-derma-text">Simulation Partenaires</label>
                                        <span className="text-derma-blue font-bold">{partnersStd + partnersPrem}</span>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <input type="range" min="0" max="100" value={partnersStd} onChange={(e) => setPartnersStd(parseInt(e.target.value))} className="flex-1 accent-derma-blue" />
                                        <input type="range" min="0" max="50" value={partnersPrem} onChange={(e) => setPartnersPrem(parseInt(e.target.value))} className="flex-1 accent-derma-gold" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-derma-text-muted">Volume d'achat moyen / mois</label>
                                        <span className="text-derma-text font-bold">CHF {avgTicket}</span>
                                    </div>
                                    <input type="range" min="500" max="5000" step="100" value={avgTicket} onChange={(e) => setAvgTicket(parseInt(e.target.value))} className="w-full transition-all" />
                                </div>
                            </div>
                            <div className="p-8 bg-derma-blue rounded-2xl text-white shadow-xl flex flex-col justify-between">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Revenu Projeté Mensuel</h4>
                                    <div className="text-4xl font-oswald tracking-tight">CHF {projectedMonthlyRevenue.toLocaleString()}</div>
                                </div>
                                <div className="mt-6">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Progression vers 100k</span>
                                        <span className="text-[12px] font-oswald text-derma-gold">{scalingCoverage.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-derma-gold" style={{ width: `${scalingCoverage}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Control Panel */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white border border-derma-border rounded-xl p-8 shadow-sm">
                        <h3 className="font-oswald text-sm uppercase tracking-widest mb-8 border-b border-derma-border pb-4">Configuration {activeTab}</h3>

                        {activeTab === 'GLOBAL' && (
                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-derma-text-muted opacity-60">Markup Standard</label>
                                        <span className="text-xl font-oswald text-derma-blue">{simStd}%</span>
                                    </div>
                                    <input type="range" min="0" max="150" step="5" value={simStd} onChange={(e) => { setSimStd(parseInt(e.target.value)); setIsSimulating(true); }} className="w-full accent-derma-blue" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-derma-text-muted opacity-60">Markup Premium</label>
                                        <span className="text-xl font-oswald text-derma-gold">{simPrem}%</span>
                                    </div>
                                    <input type="range" min="0" max="150" step="5" value={simPrem} onChange={(e) => { setSimPrem(parseInt(e.target.value)); setIsSimulating(true); }} className="w-full accent-derma-gold" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'CATEGORIES' && (
                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {categories.map(cat => (
                                    <div key={cat} className="p-4 bg-derma-bg/30 rounded-lg border border-derma-border group">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-derma-text block mb-3 group-hover:text-derma-blue transition-colors">{cat}</span>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    value={categoryMargins[cat]?.std || simStd}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        setCategoryMargins(prev => ({ ...prev, [cat]: { ...prev[cat], std: val } }));
                                                        setIsSimulating(true);
                                                    }}
                                                    className="w-full bg-white border border-derma-border rounded px-2 py-1 text-xs font-oswald"
                                                />
                                                <span className="text-[8px] font-black text-derma-text-muted uppercase mt-1 block">STD %</span>
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    value={categoryMargins[cat]?.prem || simPrem}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        setCategoryMargins(prev => ({ ...prev, [cat]: { ...prev[cat], prem: val } }));
                                                        setIsSimulating(true);
                                                    }}
                                                    className="w-full bg-white border border-derma-border rounded px-2 py-1 text-xs font-oswald"
                                                />
                                                <span className="text-[8px] font-black text-derma-text-muted uppercase mt-1 block">PREM %</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'INDIVIDUAL' && (
                            <div className="text-center py-6">
                                <p className="text-[10px] text-derma-text-muted font-bold uppercase tracking-widest opacity-50">Edita directamente en la tabla de la derecha</p>
                            </div>
                        )}

                        <div className="mt-10 border-t border-derma-border pt-8">
                            <button
                                onClick={handleApplyStrategy}
                                disabled={!isSimulating || isSaving}
                                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-[0.2em] transition-luxury
                                    ${isSimulating
                                        ? 'bg-derma-gold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                                        : 'bg-derma-bg text-derma-text-muted border border-derma-border opacity-50 cursor-not-allowed'}`}
                            >
                                {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                                Appliquer Stratégie
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="lg:col-span-3 bg-white border border-derma-border rounded-xl shadow-premium overflow-hidden flex flex-col h-full">
                    <div className="p-8 border-b border-derma-border bg-derma-bg/20 flex justify-between items-center">
                        <div>
                            <h3 className="font-oswald text-xl uppercase tracking-widest text-derma-text">Anatomie des Prix</h3>
                            <p className="text-[10px] text-derma-text-muted uppercase font-bold tracking-[0.15em] mt-1 opacity-60">Calcul dynamique basé sur {activeTab}</p>
                        </div>
                        <div className="relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-derma-text-muted" />
                            <input
                                type="text"
                                placeholder="FILTRER SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-2.5 bg-white border border-derma-border rounded-full text-[10px] font-bold tracking-[0.15em] w-64 focus:outline-none focus:border-derma-blue focus:ring-4 focus:ring-derma-blue/5 transition-luxury shadow-clinical"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-derma-border text-[9px] uppercase font-black tracking-[0.2em] text-derma-text-muted">
                                    <th className="px-8 py-6">Produit & Catégorie</th>
                                    <th className="px-8 py-6">Cout Unit.</th>
                                    <th className="px-8 py-6 text-derma-blue bg-derma-blue/[0.02]">Standard</th>
                                    <th className="px-8 py-6 text-derma-gold bg-derma-gold/[0.02]">Premium</th>
                                    <th className="px-8 py-6 text-right">Profit Est.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-derma-border">
                                {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase())).map((p) => {
                                    const cost = Number(p.cost_price || 0);
                                    const catMargin = categoryMargins[p.category || 'Otros'] || { std: simStd, prem: simPrem };
                                    const stdP = calculatePriceFromMarkup(cost, catMargin.std || simStd);
                                    const premP = calculatePriceFromMarkup(cost, catMargin.prem || simPrem);
                                    const profit = stdP - cost;

                                    return (
                                        <tr key={p.id} className="hover:bg-derma-bg/30 transition-luxury group">
                                            <td className="px-8 py-6">
                                                <div className="text-[13px] font-bold text-derma-text group-hover:text-derma-blue transition-colors">{p.name}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] text-derma-text-muted font-black tracking-widest uppercase opacity-40">{p.sku}</span>
                                                    <span className="text-[8px] bg-derma-bg px-2 py-0.5 rounded text-derma-blue font-black uppercase tracking-tighter">{p.category || 'Otros'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="relative w-32">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-derma-text-muted opacity-30 uppercase">CHF</span>
                                                    <input
                                                        type="number"
                                                        defaultValue={cost.toFixed(2)}
                                                        onBlur={(e) => handleUpdateCostPrice(p.id, parseFloat(e.target.value))}
                                                        className="w-full pl-10 pr-4 py-2 bg-derma-bg/50 border border-transparent rounded-lg text-sm font-oswald text-derma-text focus:outline-none focus:bg-white focus:border-derma-blue transition-luxury"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 bg-derma-blue/[0.02] font-oswald text-[15px] text-derma-blue font-bold tracking-tight">
                                                CHF {stdP.toFixed(2)}
                                            </td>
                                            <td className="px-8 py-6 bg-derma-gold/[0.02] font-oswald text-[15px] text-derma-gold font-bold tracking-tight">
                                                CHF {premP.toFixed(2)}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[13px] font-oswald text-[#10B981] font-bold">+ CHF {profit.toFixed(2)}</span>
                                                    <span className="text-[9px] font-black text-derma-text-muted uppercase tracking-widest opacity-40">marge brute</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPricing;