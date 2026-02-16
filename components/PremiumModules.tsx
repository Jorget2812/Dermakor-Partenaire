import React, { useState } from 'react';
import {
    TrendingUp,
    Users,
    Sparkles,
    BarChart2,
    Target,
    Zap,
    Crown,
    ArrowUpRight,
    ChevronRight,
    Search,
    BrainCircuit,
    LineChart,
    PieChart,
    Gem
} from 'lucide-react';
import { motion } from 'framer-motion';
import PremiumFeatureWrapper from './PremiumFeatureWrapper';

// --- MOCK DATA ---
const RANKING_DATA = [
    { rank: 1, name: "Institut Beauté Absolue", city: "Genève", points: 12500, trend: "up" },
    { rank: 2, name: "DermaCenter Zurich", city: "Zürich", points: 11200, trend: "stable" },
    { rank: 3, name: "Clinique La Prairie", city: "Montreux", points: 10800, trend: "down" },
    { rank: 14, name: "Votre Institut", city: "Lausanne", points: 4200, trend: "up", isUser: true }, // User position
];

const TRENDS_DATA = [
    { name: "Green Sea Peel", growth: "+125%", category: "Peeling", demand: "Very High" },
    { name: "Carboxy CO2", growth: "+85%", category: "Mask", demand: "High" },
    { name: "PDRN Salmon", growth: "+60%", category: "Mesotherapy", demand: "Rising" },
];

const RECOMMENDATIONS = [
    { type: "opportunity", title: "Potentiel Uplift", message: "Vos clients achetant 'Green Sea Peel' commandent aussi 'Repair Cream'. Stock suggéré: +5 unités." },
    { type: "alert", title: "Tendance Locale", message: "La demande pour les soins éclaircissants a augmenté de 40% dans votre région (Vaud)." },
];

// --- MODULE 1: REVENUE PROJECTION ---
export const RevenueProjectionModule: React.FC<{ isPremium: boolean }> = ({ isPremium }) => {
    return (
        <PremiumFeatureWrapper
            isPremium={isPremium}
            className="h-full bg-white p-6 md:p-8"
            description="Visualisez vos revenus futurs basés sur vos données historiques et tendances saisonnières."
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-sm text-purple-600">
                    <LineChart size={20} />
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-[2px] text-derma-black">Projection Financière (6 Mois)</h3>
            </div>

            <div className="h-48 flex items-end justify-between gap-2 mt-4 px-2">
                {[45, 52, 48, 65, 78, 92].map((h, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 group w-full">
                        <div className="relative w-full flex justify-center">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className={`w-full max-w-[40px] rounded-t-sm transition-all duration-300 ${i === 5 ? 'bg-derma-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-gray-100 group-hover:bg-derma-black/80'}`}
                            />
                            {/* Tooltip mockup */}
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[9px] py-1 px-2 rounded font-bold">
                                CHF {(h * 150).toLocaleString()}
                            </div>
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">{['Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov'][i]}</span>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                <div>
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Reenu Estimé (Nov)</span>
                    <span className="text-xl font-oswald text-derma-black">CHF 13,800</span>
                </div>
                <div className="text-right">
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Croissance</span>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+24% vs LY</span>
                </div>
            </div>
        </PremiumFeatureWrapper>
    );
};

// --- MODULE 2: PARTNER RANKING ---
export const PartnerRankingModule: React.FC<{ isPremium: boolean }> = ({ isPremium }) => {
    return (
        <PremiumFeatureWrapper
            isPremium={isPremium}
            className="h-full bg-derma-black text-white p-6 md:p-8"
            description="Comparez votre performance avec l'élite des instituts suisses."
        >
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-sm text-derma-gold">
                        <Crown size={20} />
                    </div>
                    <h3 className="text-[11px] font-bold uppercase tracking-[2px] text-white">Top Instituts (Suisse)</h3>
                </div>
                <span className="text-[9px] font-bold bg-derma-gold text-derma-black px-2 py-1 rounded uppercase tracking-widest">Elite 20</span>
            </div>

            <div className="space-y-4">
                {RANKING_DATA.map((partner, idx) => (
                    <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-sm border ${partner.isUser ? 'bg-derma-gold/20 border-derma-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-white/5 border-white/10'}`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`font-oswald text-lg w-6 ${idx < 3 ? 'text-derma-gold' : 'text-gray-500'}`}>#{partner.rank}</span>
                            <div>
                                <span className={`text-xs font-bold block ${partner.isUser ? 'text-white' : 'text-gray-300'}`}>{partner.name}</span>
                                <span className="text-[9px] text-gray-500 uppercase tracking-wider">{partner.city}</span>
                            </div>
                        </div>
                        <span className="font-mono text-xs text-derma-gold-muted">{partner.points.toLocaleString()} pts</span>
                    </div>
                ))}
            </div>

            <button className="w-full mt-6 py-3 border border-white/20 hover:bg-white/10 text-[9px] font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2">
                Voir Leaderboard Complet <ArrowUpRight size={10} />
            </button>
        </PremiumFeatureWrapper>
    );
};

// --- MODULE 3: STRATEGIC RECOMMENDATIONS (AI) ---
export const StrategicAIModule: React.FC<{ isPremium: boolean }> = ({ isPremium }) => {
    return (
        <PremiumFeatureWrapper
            isPremium={isPremium}
            className="h-full bg-gradient-to-br from-indigo-900 via-derma-black to-derma-black text-white p-6 md:p-8"
            description="Recevez des conseils personnalisés par IA pour maximiser vos ventes."
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/20 rounded-sm text-indigo-400">
                    <BrainCircuit size={20} />
                </div>
                <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-[2px] text-white">DermaKor AI Coach</h3>
                    <span className="text-[9px] text-indigo-300 uppercase tracking-widest animate-pulse">● Analyse en temps réel</span>
                </div>
            </div>

            <div className="space-y-4">
                {RECOMMENDATIONS.map((rec, idx) => (
                    <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-sm relative overflow-hidden group hover:border-indigo-500/50 transition-all">
                        <div className={`absolute top-0 left-0 w-1 h-full ${rec.type === 'opportunity' ? 'bg-green-500' : 'bg-amber-500'}`} />
                        <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${rec.type === 'opportunity' ? 'text-green-400' : 'text-amber-400'}`}>
                            {rec.type === 'opportunity' ? 'Opportunité détectée' : 'Market Alert'}
                        </h4>
                        <p className="text-xs font-light leading-relaxed text-gray-300">{rec.message}</p>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-center gap-2 p-3 bg-indigo-950/50 border border-indigo-900/50 rounded-sm">
                <Search size={14} className="text-indigo-400" />
                <input
                    type="text"
                    placeholder="Posez une question à votre coach..."
                    disabled={!isPremium}
                    className="bg-transparent border-none outline-none text-xs text-white placeholder-indigo-400/50 w-full"
                />
            </div>
        </PremiumFeatureWrapper>
    );
};

// --- MODULE 4: MARKET TRENDS ---
export const MarketTrendsModule: React.FC<{ isPremium: boolean }> = ({ isPremium }) => {
    return (
        <PremiumFeatureWrapper
            isPremium={isPremium}
            className="h-full bg-white p-6 md:p-8"
            description="Accédez aux données de marché exclusives pour anticiper la demande."
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-teal-50 rounded-sm text-teal-600">
                    <Target size={20} />
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-[2px] text-derma-black">Tendances Produits Q1</h3>
            </div>

            <div className="space-y-6">
                {TRENDS_DATA.map((trend, idx) => (
                    <div key={idx}>
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">{trend.category}</span>
                                <span className="text-sm font-bold text-derma-black">{trend.name}</span>
                            </div>
                            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{trend.growth}</span>
                        </div>
                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: trend.growth.replace('+', '').replace('%', '') + '%' }}
                                className="h-full bg-teal-500"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </PremiumFeatureWrapper>
    );
};

// --- MODULE 5: ADVANCED SIMULATOR ---
export const AdvancedSimulatorModule: React.FC<{ isPremium: boolean }> = ({ isPremium }) => {
    const [value, setValue] = useState(5000);

    return (
        <PremiumFeatureWrapper
            isPremium={isPremium}
            className="h-full bg-derma-cream border-t-4 border-t-derma-gold p-6 md:p-8"
            description="Simulez des scénarios de croissance complexes avec marges Premium."
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white rounded-sm text-derma-gold border border-derma-border">
                    <Sparkles size={20} />
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-[2px] text-derma-black">Simulateur de Croissance PRO</h3>
            </div>

            <div className="bg-white p-6 rounded-sm border border-derma-border shadow-sm mb-6">
                <div className="flex justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Investissement</span>
                    <span className="text-lg font-mono font-bold text-derma-black">CHF {value.toLocaleString()}</span>
                </div>
                <input
                    type="range"
                    min="1000"
                    max="20000"
                    step="500"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full accent-derma-gold h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    disabled={!isPremium}
                />

                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-dashed border-gray-200">
                    <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Marge Est.</span>
                        <span className="text-xl font-oswald text-derma-gold">48%</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Profit Net</span>
                        <span className="text-xl font-oswald text-green-600">+CHF {(value * 0.92).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                </div>
            </div>

            <p className="text-[9px] text-gray-500 italic text-center">
                *Inclut les bonus de fin d'année et remises volume exclusives Elite.
            </p>
        </PremiumFeatureWrapper>
    );
};

// --- MODULE 6: PARTNER STATUS DETAIL ---
export const PartnerStatusModule: React.FC<{ isPremium: boolean }> = ({ isPremium }) => {
    return (
        <PremiumFeatureWrapper
            isPremium={isPremium}
            className="h-full bg-white p-6 md:p-8"
            description="Suivi détaillé de votre progression vers le statut Elite et ses avantages."
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-sm text-blue-600">
                    <Users size={20} />
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-[2px] text-derma-black">Statut Partenaire Avancé</h3>
            </div>

            <div className="relative pt-4 pb-8">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>

                {/* Steps */}
                <div className="flex justify-between relative z-10 font-bold">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-derma-gold text-white flex items-center justify-center border-4 border-white shadow-sm">
                            <Crown size={12} fill="currentColor" />
                        </div>
                        <span className="text-[9px] uppercase tracking-wider text-derma-black">Silver</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white text-gray-300 flex items-center justify-center border-4 border-gray-100">
                            <Crown size={12} />
                        </div>
                        <span className="text-[9px] uppercase tracking-wider text-gray-400">Gold</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white text-gray-300 flex items-center justify-center border-4 border-gray-100">
                            <Crown size={12} />
                        </div>
                        <span className="text-[9px] uppercase tracking-wider text-gray-400">Elite</span>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-sm border border-blue-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">Prochain Palier: Gold</span>
                    <span className="text-[10px] font-bold text-blue-600">65%</span>
                </div>
                <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-[65%]" />
                </div>
                <p className="text-[9px] text-blue-500 mt-2 font-medium">
                    Plus que 1,200 CHF pour débloquer +5% de remise permanente.
                </p>
            </div>
        </PremiumFeatureWrapper>
    );
};

// --- MODULE 7: EARLY ACCESS ---
export const EarlyAccessModule: React.FC<{ isPremium: boolean }> = ({ isPremium }) => {
    return (
        <PremiumFeatureWrapper
            isPremium={isPremium}
            className="h-full bg-derma-black text-white p-0 overflow-hidden relative group"
            description="Soyez les premiers à commander les nouveautés avant le lancement officiel."
        >
            <img
                src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=600"
                alt="Early Access"
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-derma-black via-derma-black/60 to-transparent" />

            <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-derma-gold text-derma-black rounded-full text-[9px] font-bold uppercase tracking-widest w-fit mb-3">
                    <Gem size={10} /> Exclusivité
                </div>
                <h3 className="font-oswald text-2xl uppercase tracking-wide mb-2">New: Platinum PN Series</h3>
                <p className="text-xs text-gray-300 font-light mb-6 line-clamp-2">
                    La nouvelle génération de polynucléotides pour une régénération cellulaire avancée. Disponible maintenant pour Elite Partners.
                </p>
                <button className="flex items-center justify-between w-full p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-sm transition-all group/btn">
                    <span className="text-[10px] font-bold uppercase tracking-[2px]">Pré-commander</span>
                    <ArrowUpRight size={14} className="group-hover/btn:rotate-45 transition-transform" />
                </button>
            </div>
        </PremiumFeatureWrapper>
    );
};
