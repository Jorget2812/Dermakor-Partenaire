import React, { useState, useEffect } from 'react';
import { Search, Save, RefreshCw, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { PROFIT_RULES } from '../constants/financials';

const AdminPricing: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'GLOBAL' | 'CATEGORIES' | 'INDIVIDUAL'>('GLOBAL');
    const [officialCategories, setOfficialCategories] = useState<{ id: string, name: string }[]>([]);

    // Configuration States
    const [simStd, setSimStd] = useState(1.8);
    const [simPrem, setSimPrem] = useState(2.3);
    const [minMarginChf, setMinMarginChf] = useState(6);
    const [categoryMargins, setCategoryMargins] = useState<Record<string, { std: number, prem: number }>>({});
    const [isSimulating, setIsSimulating] = useState(false);

    // Hierarchy Level Theme
    const LEVEL_THEME = {
        GLOBAL: { label: 'GLOBAL', color: 'bg-gray-100 text-gray-500 border-gray-200', iconColor: 'text-gray-400' },
        CATEGORY: { label: 'CATÉGORIE', color: 'bg-blue-50 text-blue-600 border-blue-100', iconColor: 'text-blue-500' },
        INDIVIDUAL: { label: 'INDIVIDUEL', color: 'bg-derma-gold/10 text-derma-gold border-derma-gold/20', iconColor: 'text-derma-gold' }
    };

    const fetchPricingData = async () => {
        setIsLoading(true);
        try {
            const { data: productsData } = await supabase.from('products').select('*').order('name');
            const { data: settingsData } = await supabase.from('site_settings').select('*');
            const { data: categoriesData } = await supabase.from('categories').select('id, name').order('name');

            const globalSet = settingsData?.find(s => s.key === 'global_pricing')?.value || { std_mult: 1.8, prem_mult: 2.3, min_margin_chf: 6 };
            const categorySet = settingsData?.find(s => s.key === 'category_pricing')?.value || {};

            setSimStd(globalSet.std_mult);
            setSimPrem(globalSet.prem_mult);
            setMinMarginChf(globalSet.min_margin_chf);
            setCategoryMargins(categorySet);
            setOfficialCategories(categoriesData || []);

            const mappedProducts = (productsData || []).map(p => ({
                ...p,
                costPrice: p.cost_price,
                retailPrice: p.retail_price,
                pricing: p.pricing || {}
            }));
            setProducts(mappedProducts);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPricingData();
    }, []);

    const categories = officialCategories.map(c => c.name);

    const handleApplyStrategy = async () => {
        setIsSaving(true);
        setError(null);
        try {
            // Save global margins
            const { error: settingsError } = await supabase.from('site_settings').upsert({
                key: 'global_pricing',
                value: { std_mult: simStd, prem_mult: simPrem, min_margin_chf: minMarginChf }
            });

            if (settingsError) throw new Error("Erreur site_settings: " + settingsError.message);

            // Save category margins
            const { error: catSettingsError } = await supabase.from('site_settings').upsert({
                key: 'category_pricing',
                value: categoryMargins
            });

            if (catSettingsError) throw new Error("Erreur site_settings_cat: " + catSettingsError.message);

            alert(`Stratégie de prix enregistrée avec succès.`);
            setIsSimulating(false);
            await fetchPricingData();
        } catch (err: any) {
            console.error("Critical error in handleApplyStrategy:", err);
            setError(err.message || "Une erreur critique est survenue.");
        } finally {
            setIsSaving(false);
        }
    };

    const resolveEffectivePricing = (product: any) => {
        const cat = product.category || 'Otros';
        const pPricing = product.pricing || {};

        let level: 'GLOBAL' | 'CATEGORY' | 'INDIVIDUAL' = 'GLOBAL';
        let stdMult = simStd;
        let premMult = simPrem;

        if (categoryMargins[cat]) {
            level = 'CATEGORY';
            stdMult = categoryMargins[cat].std || simStd;
            premMult = categoryMargins[cat].prem || simPrem;
        }

        if (pPricing.std_mult || pPricing.prem_mult) {
            level = 'INDIVIDUAL';
            stdMult = pPricing.std_mult || stdMult;
            premMult = pPricing.prem_mult || premMult;
        }

        const cost = Number(product.costPrice || 0);
        const retail = Number(product.retailPrice || 0);

        const stdPrice = retail / stdMult;
        const premPrice = retail / premMult;
        const stdMargin = stdPrice - cost;
        const premMargin = premPrice - cost;

        return { stdMult, premMult, stdPrice, premPrice, stdMargin, premMargin, level, cost, retail };
    };

    const handleUpdateIndividualMultiplier = async (id: string, std_mult: number | null, prem_mult: number | null) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        try {
            const newPricing = { ...product.pricing, std_mult, prem_mult };
            if (std_mult === null) delete newPricing.std_mult;
            if (prem_mult === null) delete newPricing.prem_mult;

            const { error } = await supabase.from('products').update({ pricing: newPricing }).eq('id', id);
            if (error) throw error;

            setProducts(products.map(p => p.id === id ? { ...p, pricing: newPricing } : p));
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateRetailPrice = async (id: string, newRetailPrice: number) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        const { stdMult, premMult, cost } = resolveEffectivePricing(product);
        const stdP = newRetailPrice / stdMult;
        const premP = newRetailPrice / premMult;

        if ((stdP - cost) < minMarginChf || (premP - cost) < minMarginChf) {
            alert(`⚠️ Risque: Le PVC ${newRetailPrice} CHF ne permet pas de garantir la marge minimale de ${minMarginChf} CHF.`);
            return;
        }

        try {
            const { error } = await supabase.from('products').update({ retail_price: newRetailPrice }).eq('id', id);
            if (error) throw error;
            setProducts(products.map(p => p.id === id ? { ...p, retailPrice: newRetailPrice } : p));
        } catch (err) { console.error(err); }
    };

    const getSecurityLevel = (margin: number) => {
        if (margin < minMarginChf) return { label: 'RISQUE', color: 'text-red-600 bg-red-50 border-red-100', dot: 'bg-red-500' };
        if (margin < minMarginChf + 4) return { label: 'FAIBLE', color: 'text-orange-600 bg-orange-50 border-orange-100', dot: 'bg-orange-500' };
        if (margin < minMarginChf + 10) return { label: 'OPTIMAL', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', dot: 'bg-emerald-500' };
        return { label: 'PREMIUM', color: 'text-derma-gold bg-derma-gold/5 border-derma-gold/20', dot: 'bg-derma-gold' };
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Strategy Header */}
            <div className="bg-white border border-derma-border rounded-xl p-8 shadow-premium">
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="text-derma-gold" size={24} />
                            <h1 className="font-oswald text-2xl uppercase tracking-tight text-derma-text">Gouvernance des Prix</h1>
                        </div>
                        <p className="text-[11px] text-derma-text-muted font-bold uppercase tracking-widest opacity-60">Architecture Hiérarchique: Global &gt; Catégorie &gt; Individuel</p>
                    </div>

                    <div className="flex bg-derma-bg/40 p-1.5 rounded-xl border border-derma-border shadow-inner">
                        {['GLOBAL', 'CATEGORIES', 'INDIVIDUAL'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setActiveTab(t as any)}
                                className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300
                                    ${activeTab === t ? 'bg-white text-derma-blue shadow-md' : 'text-derma-text-muted hover:text-derma-text'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-10">
                    <div className="lg:col-span-1 border-r border-derma-border pr-8 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-derma-blue">Configuration {activeTab}</h3>

                            {activeTab === 'GLOBAL' && (
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-[9px] font-bold uppercase text-derma-text-muted">Mult. Standard</span>
                                            <input type="number" step="0.1" value={simStd}
                                                onChange={(e) => { setSimStd(parseFloat(e.target.value)); setIsSimulating(true); }}
                                                className="w-16 bg-transparent border-b border-derma-border text-right font-oswald text-lg text-derma-blue" />
                                        </div>
                                        <input type="range" min="1.0" max="3.0" step="0.1" value={simStd}
                                            onChange={(e) => { setSimStd(parseFloat(e.target.value)); setIsSimulating(true); }}
                                            className="w-full h-1.5 bg-gray-100 rounded-full appearance-none accent-derma-blue" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-[9px] font-bold uppercase text-derma-text-muted">Mult. Premium</span>
                                            <input type="number" step="0.1" value={simPrem}
                                                onChange={(e) => { setSimPrem(parseFloat(e.target.value)); setIsSimulating(true); }}
                                                className="w-16 bg-transparent border-b border-derma-border text-right font-oswald text-lg text-derma-gold" />
                                        </div>
                                        <input type="range" min="1.5" max="4.0" step="0.1" value={simPrem}
                                            onChange={(e) => { setSimPrem(parseFloat(e.target.value)); setIsSimulating(true); }}
                                            className="w-full h-1.5 bg-gray-100 rounded-full appearance-none accent-derma-gold" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-[9px] font-bold uppercase text-derma-text-muted">Marge Min (CHF)</span>
                                            <input type="number" value={minMarginChf}
                                                onChange={(e) => { setMinMarginChf(parseFloat(e.target.value)); setIsSimulating(true); }}
                                                className="w-16 bg-transparent border-b border-derma-border text-right font-oswald text-lg text-derma-text" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'CATEGORIES' && (
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {categories.map(cat => (
                                        <div key={cat} className="p-3 bg-derma-bg/30 rounded-lg border border-derma-border">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-derma-text-muted block mb-2">{cat}</span>
                                            <div className="grid grid-cols-2 gap-2 text-center">
                                                <div>
                                                    <input type="number" step="0.1" value={categoryMargins[cat]?.std || simStd}
                                                        onChange={(e) => { setCategoryMargins(prev => ({ ...prev, [cat]: { ...(prev[cat] || { std: simStd, prem: simPrem }), std: parseFloat(e.target.value) } })); setIsSimulating(true); }}
                                                        className="w-full bg-white border border-derma-border rounded py-1 font-oswald text-xs text-derma-blue text-center" />
                                                    <span className="text-[7px] font-bold uppercase opacity-50">Std</span>
                                                </div>
                                                <div>
                                                    <input type="number" step="0.1" value={categoryMargins[cat]?.prem || simPrem}
                                                        onChange={(e) => { setCategoryMargins(prev => ({ ...prev, [cat]: { ...(prev[cat] || { std: simStd, prem: simPrem }), prem: parseFloat(e.target.value) } })); setIsSimulating(true); }}
                                                        className="w-full bg-white border border-derma-border rounded py-1 font-oswald text-xs text-derma-gold text-center" />
                                                    <span className="text-[7px] font-bold uppercase opacity-50">Prem</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'INDIVIDUAL' && (
                                <div className="text-center py-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <Info className="mx-auto text-blue-400 mb-2" size={16} />
                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest leading-relaxed">
                                        Surclassez les prix directement dans le catalogue ci-dessous.
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleApplyStrategy}
                            disabled={!isSimulating || isSaving}
                            className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-[0.2em] transition-all
                                ${isSimulating ? 'bg-derma-gold text-white shadow-lg hover:brightness-110 active:scale-95' : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'}`}
                        >
                            {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                            Sauvegarder Plan
                        </button>
                    </div>

                    <div className="lg:col-span-3 flex flex-col justify-end">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-derma-bg/30 p-6 rounded-2xl border border-derma-border">
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-derma-text-muted mb-2 block">Seuil de Rentabilité</span>
                                <div className="text-2xl font-oswald text-derma-text tracking-tighter">CHF {minMarginChf.toFixed(2)}</div>
                                <div className="h-1 w-12 bg-derma-gold mt-3 rounded-full"></div>
                                <p className="text-[8px] font-bold text-derma-text-muted mt-2 opacity-50 uppercase tracking-widest">Protection absolue de marge</p>
                            </div>
                            <div className="bg-derma-blue p-6 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                                <Search className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-125 transition-transform duration-700" size={100} />
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-60 mb-2 block">Standard Index</span>
                                <div className="text-2xl font-oswald tracking-tighter">x {simStd.toFixed(2)}</div>
                                <p className="text-[8px] font-bold mt-2 opacity-60 uppercase tracking-widest">Mult. Global Appliqué</p>
                            </div>
                            <div className="bg-derma-black p-6 rounded-2xl text-white shadow-xl">
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-derma-gold mb-2 block">Premium Impact</span>
                                <div className="text-2xl font-oswald tracking-tighter">x {simPrem.toFixed(2)}</div>
                                <p className="text-[8px] font-bold mt-2 opacity-40 uppercase tracking-widest">Mult. Prestige & VIP</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Catalog Grid */}
            <div className="bg-white border border-derma-border rounded-xl shadow-premium overflow-hidden">
                <div className="p-6 border-b border-derma-border bg-derma-bg/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-derma-text-muted opacity-40" size={16} />
                        <input
                            type="text"
                            placeholder="RECHERCHER SKU OU NOM..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-3 bg-white border border-derma-border rounded-xl text-[10px] font-black tracking-widest uppercase focus:ring-2 focus:ring-derma-blue/10 transition-all shadow-clinical"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white border-b border-derma-border text-[9px] uppercase font-black tracking-[0.2em] text-derma-text-muted">
                                <th className="px-8 py-6">Intelligence Produit</th>
                                <th className="px-8 py-6">Cout Unit.</th>
                                <th className="px-8 py-6">PVC (Conseillé)</th>
                                <th className="px-8 py-6">Rendu Standard</th>
                                <th className="px-8 py-6">Rendu Premium</th>
                                <th className="px-8 py-6 text-right">Protection</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-derma-border">
                            {products
                                .filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((p) => {
                                    const pricing = resolveEffectivePricing(p);
                                    const theme = LEVEL_THEME[pricing.level];
                                    const security = getSecurityLevel(pricing.stdMargin);

                                    return (
                                        <tr key={p.id} className="hover:bg-derma-bg/20 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${security.dot} animate-pulse`}></div>
                                                    <div>
                                                        <div className="text-[13px] font-bold text-derma-text group-hover:text-derma-blue transition-colors">{p.name}</div>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className="text-[8px] font-black text-derma-text-muted opacity-40 uppercase tracking-widest">{p.sku}</span>
                                                            <span className={`text-[7px] px-2 py-0.5 rounded border font-black uppercase tracking-tighter ${theme.color}`}>
                                                                {theme.label}: {p.category || 'Otros'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-xs font-oswald font-bold text-derma-text opacity-70">CHF {pricing.cost.toFixed(2)}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="relative w-32 group/pvc">
                                                    <input
                                                        type="number"
                                                        defaultValue={pricing.retail.toFixed(2)}
                                                        onBlur={(e) => handleUpdateRetailPrice(p.id, parseFloat(e.target.value))}
                                                        className={`w-full bg-derma-bg/30 border border-derma-border rounded-lg px-3 py-2 text-sm font-oswald font-bold focus:bg-white transition-all
                                                            ${pricing.stdMargin < minMarginChf ? 'bg-red-50 border-red-300 text-red-600' : 'text-derma-text'}`}
                                                    />
                                                    <div className="absolute -top-2 -right-2 hidden group-hover/pvc:flex">
                                                        <div className="bg-derma-black text-[8px] font-black text-white px-2 py-0.5 rounded shadow-xl uppercase tracking-widest">
                                                            Modifier PVC
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-oswald text-sm font-bold text-derma-blue">CHF {pricing.stdPrice.toFixed(2)}</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder={pricing.stdMult.toFixed(2)}
                                                            onBlur={(e) => handleUpdateIndividualMultiplier(p.id, parseFloat(e.target.value) || null, null)}
                                                            className="w-12 bg-transparent border-b border-derma-border/50 text-[10px] text-center font-bold text-derma-blue/50 focus:border-derma-blue focus:text-derma-blue outline-none"
                                                        />
                                                    </div>
                                                    <span className="text-[8px] font-bold text-derma-text-muted uppercase opacity-40">Profit: +{pricing.stdMargin.toFixed(2)}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-oswald text-sm font-bold text-derma-gold">CHF {pricing.premPrice.toFixed(2)}</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder={pricing.premMult.toFixed(2)}
                                                            onBlur={(e) => handleUpdateIndividualMultiplier(p.id, null, parseFloat(e.target.value) || null)}
                                                            className="w-12 bg-transparent border-b border-derma-border/50 text-[10px] text-center font-bold text-derma-gold/50 focus:border-derma-gold focus:text-derma-gold outline-none"
                                                        />
                                                    </div>
                                                    <span className="text-[8px] font-bold text-derma-text-muted uppercase opacity-40">Profit: +{pricing.premMargin.toFixed(2)}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className={`px-2.5 py-1 rounded-full border text-[8px] font-black uppercase tracking-[0.1em] flex items-center gap-2 ${security.color}`}>
                                                        <div className={`w-1 h-1 rounded-full ${security.dot}`}></div>
                                                        {security.label}
                                                    </div>
                                                    {pricing.level === 'INDIVIDUAL' && (
                                                        <button
                                                            onClick={() => handleUpdateIndividualMultiplier(p.id, null, null)}
                                                            className="text-[7px] font-black text-derma-blue uppercase tracking-widest hover:underline mt-1"
                                                        >
                                                            Reset Inherit
                                                        </button>
                                                    )}
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
    );
};

export default AdminPricing;