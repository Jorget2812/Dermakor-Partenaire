import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    TrendingUp,
    Award,
    BarChart3,
    ChevronRight,
    Clock,
    Target,
    ArrowUpRight,
    ShieldCheck,
    Zap,
    DollarSign,
    Calculator,
    ShoppingCart,
    BookOpen,
    Play,
    Sparkles,
    Lock,
    Bell,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { UserTier } from '../types';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { motion } from 'framer-motion';
import {
    RevenueProjectionModule,
    PartnerRankingModule,
    StrategicAIModule,
    MarketTrendsModule,
    AdvancedSimulatorModule,
    PartnerStatusModule,
    EarlyAccessModule
} from '../components/PremiumModules';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [stats, setStats] = useState({
        currentSpend: 0,
        monthlyGoal: 300,
        ordersCount: 0
    });
    const [simulatedSpend, setSimulatedSpend] = useState<number>(1500);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user) return;
            try {
                const { data: orders } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('partner_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                const totalSpend = orders?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0;
                setStats({
                    currentSpend: totalSpend,
                    monthlyGoal: user.monthlyGoal,
                    ordersCount: orders?.length || 0
                });
                setRecentOrders(orders || []);

                // Fetch Notifications
                const { data: notifies } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('partner_id', user.id)
                    .eq('is_read', false)
                    .order('created_at', { ascending: false })
                    .limit(3);

                setNotifications(notifies || []);

            } catch (err) {
                console.error('Dashboard: Error loading data:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadDashboardData();
    }, [user]);

    const handleOrderRedirect = () => navigate('/dashboard/orders');

    const markNotificationsAsRead = async () => {
        if (!user || notifications.length === 0) return;
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('partner_id', user.id);

            if (error) throw error;
            setNotifications([]);
        } catch (err) {
            console.error('Error marking notifications as read:', err);
        }
    };

    const calculateSimulatedProfit = (spend: number) => {
        const margin = spend >= 4000 ? 0.44 : spend >= 2000 ? 0.42 : 0.40;
        const retail = spend / (1 - margin);
        return { retail, profit: retail - spend };
    };

    const isPremium = user?.tier && user.tier !== UserTier.STANDARD;

    if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-derma-gold"></div></div>;

    const progressPercent = Math.min((stats.currentSpend / stats.monthlyGoal) * 100, 100);

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 lg:p-8 animate-fade-in bg-white">
            {/* Header: Executive Greetings */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-derma-border pb-8">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-[3px] text-derma-gold mb-2 block">Executive Overview</span>
                    <h1 className="font-serif text-4xl text-derma-black leading-tight">
                        {t('dash_welcome')}{user?.name?.split(' ')[0]}
                    </h1>
                    <p className="text-derma-text-muted mt-2 font-light">Performance et croissance stratégique de votre institut.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-derma-cream border border-derma-border rounded-full text-[10px] font-bold uppercase tracking-wider text-derma-text">
                        {user?.instituteName}
                    </span>
                    <div className="flex items-center gap-2 px-3 py-1 bg-derma-gold/5 border border-derma-gold/10 rounded-full">
                        <Award size={14} className="text-derma-gold" />
                        <span className="text-[10px] font-bold text-derma-gold uppercase tracking-wider">
                            {user?.tier === UserTier.STANDARD ? 'Standard' :
                                user?.tier === UserTier.PREMIUM_ELITE ? 'Elite' :
                                    user?.tier === UserTier.PREMIUM_PRO ? 'Pro' : 'Premium'} Partner
                        </span>
                    </div>
                </div>
            </div>

            {/* Strategic Grid: Row 1 (Engagement & Profit) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Block A: Engagement Contractual */}
                <div className="bg-derma-cream border border-derma-border p-8 rounded-sm shadow-premium flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-derma-text mb-1">Engagement Contractue</h3>
                            <p className="text-xl font-serif text-derma-black leading-tight">Cycle de Performance: Mois {user?.consecutiveMonths || 1} de 6</p>
                        </div>
                        <Clock className="text-derma-gold-muted" size={20} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-derma-text-muted">Achat mensuel</span>
                            <span className="text-xs font-bold text-derma-black">CHF {stats.currentSpend.toLocaleString()} / {stats.monthlyGoal.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white border border-derma-border rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-derma-gold"
                            />
                        </div>
                        <p className="text-[9px] uppercase tracking-widest text-derma-text-muted text-right font-bold">
                            {progressPercent >= 100 ? "Objectif atteint" : `Manque CHF ${(stats.monthlyGoal - stats.currentSpend).toLocaleString()}`}
                        </p>
                    </div>
                </div>

                {/* Profit Retail Widget */}
                <div className="bg-white border border-derma-border p-8 rounded-sm shadow-premium group hover:border-derma-gold transition-luxury flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-derma-gold/5 rounded-sm">
                                <TrendingUp size={18} className="text-derma-gold" />
                            </div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[2px] text-derma-text">Facturation Retail Estimée</h4>
                        </div>
                        <p className="font-serif text-4xl text-derma-black mb-1">CHF {user?.profitData?.estimatedRetailSales.toLocaleString() || '0'}</p>
                    </div>
                    <p className="text-[10px] text-derma-text-muted tracking-widest uppercase mt-4">Prix de vente conseillé</p>
                </div>

                {/* Profit Net Widget */}
                <div className="bg-white border border-derma-border p-8 rounded-sm shadow-premium group hover:border-derma-gold transition-luxury flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-50 rounded-sm">
                                <DollarSign size={18} className="text-green-600" />
                            </div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[2px] text-derma-text">Bénéfice Net Estimé</h4>
                        </div>
                        <p className="font-serif text-4xl text-derma-black mb-1">CHF {user?.profitData?.estimatedProfit.toLocaleString() || '0'}</p>
                    </div>
                    <p className="text-[10px] text-derma-text-muted tracking-widest uppercase mt-4">Marge actuelle: {user?.profitData?.margin.toFixed(0) || '35'}%</p>
                </div>
            </div>

            {/* Strategic Grid: Row 2 (Ranking & High-Value Info) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ranking Widget */}
                <div className="bg-derma-blue-executive p-8 rounded-sm text-white shadow-deep relative overflow-hidden group">
                    <Award className="absolute -bottom-4 -right-4 text-white/5 group-hover:scale-110 transition-transform duration-1000" size={120} />
                    <h4 className="text-[10px] font-bold uppercase tracking-[2px] text-derma-gold-muted mb-6">Position Nationale</h4>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-serif">#{user?.ranking || '--'}</span>
                        <span className="text-derma-gold-muted text-sm font-light">sur 20 Elite</span>
                    </div>
                    <p className="text-[10px] text-blue-200/50 font-light mb-8 italic tracking-wider uppercase">Compétition exclusive</p>
                    <div className="space-y-4 pt-6 border-t border-white/10">
                        <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase"><ShieldCheck size={14} className="text-derma-gold" /> <span>Accès anticipé</span></div>
                        <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase"><Zap size={14} className="text-derma-gold" /> <span>Priorité de stock</span></div>
                    </div>
                </div>

                {/* Recommended Academy (Moved here to fill the grid) */}
                <div className="bg-white border border-derma-border p-8 rounded-sm shadow-premium flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-derma-black text-white rounded-sm">
                                <BookOpen size={18} />
                            </div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[2px] text-derma-black">{t('academy_dash_recommended')}</h4>
                        </div>
                        <div className="flex gap-4 group cursor-pointer" onClick={() => navigate('/dashboard/academy')}>
                            <div className="w-20 h-14 bg-derma-cream rounded-sm overflow-hidden flex-shrink-0 border border-derma-border">
                                <img src="https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?q=80&w=200" className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Academy" />
                            </div>
                            <div>
                                <h5 className="text-[11px] font-bold text-derma-black uppercase tracking-tight group-hover:text-derma-gold transition-colors">Green Sea Peel Advanced</h5>
                                <p className="text-[9px] text-derma-text-muted mt-1 leading-relaxed line-clamp-2">Optimisez votre rentabilidad clínica.</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => navigate('/dashboard/academy')} className="mt-6 w-full py-3 bg-derma-cream border border-derma-border text-[9px] font-bold uppercase tracking-widest text-derma-text hover:bg-derma-black hover:text-white transition-luxury flex items-center justify-center gap-2">
                        Accéder <ArrowUpRight size={12} />
                    </button>
                </div>

                {/* Trend Protocol (Moved here to fill the grid) */}
                <div className="bg-derma-cream border border-derma-border p-8 rounded-sm shadow-premium flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-derma-gold/10 text-derma-gold rounded-sm">
                                <Sparkles size={18} />
                            </div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[2px] text-derma-black">{t('academy_dash_trend')}</h4>
                        </div>
                        <div className="bg-white p-4 border border-derma-border flex justify-between items-center group cursor-pointer rounded-sm" onClick={() => navigate('/dashboard/academy')}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-derma-gold/5 rounded-full">
                                    <Play size={12} className="text-derma-gold" />
                                </div>
                                <p className="text-[10px] font-bold text-derma-black uppercase tracking-tight">Upselling Dermocosmétique</p>
                            </div>
                            <ChevronRight size={14} className="text-derma-border group-hover:text-derma-gold transition-all" />
                        </div>
                    </div>
                    <p className="text-[9px] text-derma-text-muted italic mt-4">Protocoles à haute valeur ajoutée.</p>
                </div>
            </div>

            {/* Notifications Section */}
            {notifications.length > 0 && (
                <div className="bg-[#1A1A1A] text-white p-6 rounded-sm shadow-deep border-l-4 border-derma-gold flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-derma-gold/20 rounded-full">
                            <Bell className="text-derma-gold animate-bounce" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-[3px] text-derma-gold-muted mb-1">Centre de Notifications</h3>
                            <p className="text-lg font-serif">{notifications[0].title}</p>
                            <p className="text-sm text-gray-400 mt-1 max-w-xl">{notifications[0].message}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <button
                            onClick={markNotificationsAsRead}
                            className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            Ignorer
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/orders')}
                            className="px-6 py-3 bg-derma-gold text-derma-black text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg"
                        >
                            Détails de la commande
                        </button>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                </div>
            )}

            {/* Block C: Grow Simulator & Strategic Training */}
            <div className="space-y-8">
                <div className="bg-derma-cream border border-derma-border p-8 rounded-sm shadow-premium">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-derma-gold/10 rounded-sm">
                            <Calculator size={20} className="text-derma-gold" />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-derma-text">Simulador de Crecimiento Estratégico</h3>
                            <p className="text-sm text-derma-text-muted font-light">Projetez votre rentabilité en augmentant votre volume d'approvisionnement.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
                        <div className="lg:col-span-1 space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-derma-text-muted">Volume Mensuel (CHF)</label>
                            <select
                                value={simulatedSpend}
                                onChange={(e) => setSimulatedSpend(Number(e.target.value))}
                                className="w-full bg-white border border-derma-border px-4 py-3 text-sm focus:border-derma-gold outline-none transition-colors font-medium"
                            >
                                <option value={1500}>1,500 CHF (Base)</option>
                                <option value={3000}>3,000 CHF (Pro ⭐)</option>
                                <option value={5000}>5,000 CHF (Elite 👑)</option>
                            </select>
                        </div>
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-white border border-derma-border rounded-sm">
                                <span className="text-[10px] text-derma-text-muted uppercase tracking-wider block mb-2">Niveau Atteint</span>
                                <p className="text-lg font-serif text-derma-gold uppercase tracking-widest">
                                    {simulatedSpend >= 4000 ? 'Premium Elite' : simulatedSpend >= 2000 ? 'Premium Pro' : 'Premium Base'}
                                </p>
                            </div>
                            <div className="p-6 bg-white border border-derma-border rounded-sm">
                                <span className="text-[10px] text-derma-text-muted uppercase tracking-wider block mb-2">Retail Estimé</span>
                                <p className="text-2xl font-serif text-derma-black">CHF {calculateSimulatedProfit(simulatedSpend).retail.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                            <div className="p-6 bg-derma-gold/5 border border-derma-gold/20 rounded-sm">
                                <span className="text-[10px] text-derma-gold uppercase tracking-wider block mb-2 font-bold">Bénéfice Net</span>
                                <p className="text-2xl font-serif text-derma-black">CHF {calculateSimulatedProfit(simulatedSpend).profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Recent Activity Table */}
            <div className="bg-white border border-derma-border p-8 rounded-sm shadow-premium">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <BarChart3 size={20} className="text-derma-text-muted" />
                        <h4 className="text-[10px] font-bold uppercase tracking-[2px] text-derma-black">{t('dash_recent_orders')}</h4>
                    </div>
                    <button
                        onClick={handleOrderRedirect}
                        className="text-[10px] uppercase tracking-widest text-derma-gold font-bold hover:underline flex items-center gap-1"
                    >
                        {t('dash_view_all')} <ChevronRight size={12} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-derma-border pb-4">
                                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-derma-text-muted">{t('dash_order_id')}</th>
                                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-derma-text-muted">{t('dash_date')}</th>
                                <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-derma-text-muted">{t('dash_status')}</th>
                                <th className="pb-4 text-right text-[10px] font-bold uppercase tracking-widest text-derma-text-muted">{t('dash_amount')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-derma-border">
                            {recentOrders.length > 0 ? recentOrders.map((order) => (
                                <tr key={order.id} className="group hover:bg-derma-cream/50 transition-colors">
                                    <td className="py-4 text-xs font-medium text-derma-black">#{order.id.slice(0, 8)}</td>
                                    <td className="py-4 text-xs text-derma-text-muted">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-[9px] w-fit uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-50 text-green-600' :
                                                order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {order.status === 'SHIPPED' ? 'Expédiée' : order.status === 'DELIVERED' ? 'Livrée' : order.status}
                                            </span>
                                            {order.status === 'SHIPPED' && order.tracking_number && (
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] text-derma-text-muted uppercase font-bold">{order.carrier || 'Swiss Post'}</span>
                                                    <span className="text-[10px] text-derma-gold font-mono font-bold">{order.tracking_number}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 text-xs font-medium text-derma-black text-right">CHF {order.total_amount.toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-xs text-derma-text-muted italic">Aucune commande récente trouvée.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium Intelligence Suite */}
            <div className="pt-8 border-t border-derma-border">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-derma-black text-white rounded-sm shadow-lg">
                        <Sparkles size={24} className="text-derma-gold" />
                    </div>
                    <div>
                        <h2 className="font-oswald text-2xl text-derma-black uppercase tracking-widest">Premium Intelligence Suite</h2>
                        <p className="text-sm text-derma-text-muted font-light mt-1">Outils stratégiques avancés pour partenaires Elite.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {/* Row 1 */}
                    <div className="lg:col-span-2 min-h-[320px]">
                        <RevenueProjectionModule isPremium={!!isPremium} />
                    </div>
                    <div className="min-h-[320px]">
                        <PartnerStatusModule isPremium={!!isPremium} />
                    </div>

                    {/* Row 2 */}
                    <div className="min-h-[320px]">
                        <PartnerRankingModule isPremium={!!isPremium} />
                    </div>
                    <div className="lg:col-span-2 min-h-[320px]">
                        <AdvancedSimulatorModule isPremium={!!isPremium} />
                    </div>

                    {/* Row 3 */}
                    <div className="min-h-[320px]">
                        <MarketTrendsModule isPremium={!!isPremium} />
                    </div>
                    <div className="min-h-[320px]">
                        <StrategicAIModule isPremium={!!isPremium} />
                    </div>
                    <div className="min-h-[320px]">
                        <EarlyAccessModule isPremium={!!isPremium} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
