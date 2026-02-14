import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import {
  ShoppingBag,
  TrendingUp,
  Award,
  Clock,
  ChevronRight,
  ArrowUpRight,
  Target,
  Loader2
} from 'lucide-react';
import { UserTier } from '../types';
import { supabase } from '../utils/supabase';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    currentSpend: 0,
    monthlyGoal: 800,
    ordersCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchPartnerStats = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (orders) {
        const totalSpend = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        setStats({
          currentSpend: totalSpend,
          monthlyGoal: 800,
          ordersCount: orders.length
        });

        const formatted = orders.slice(0, 3).map(o => ({
          id: (o.id || '').toString().slice(0, 8).toUpperCase(),
          date: o.created_at ? new Date(o.created_at).toLocaleDateString() : 'N/A',
          amount: `CHF ${Number(o.total_amount || 0).toFixed(2)}`,
          status: o.status || 'PENDING'
        }));
        setRecentOrders(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerStats();
  }, [user]);

  const progress = Math.min((stats.currentSpend / stats.monthlyGoal) * 100, 100);

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-derma-gold" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-derma-gold/10 rounded-sm group-hover:bg-derma-gold/20 transition-colors">
              <TrendingUp className="text-derma-gold" size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('dash_monthly_goal')}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-serif text-3xl text-derma-black">CHF {stats.currentSpend.toFixed(0)}</h3>
            <span className="text-gray-400 text-sm">/ {stats.monthlyGoal}</span>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-derma-gold transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-[10px] text-gray-500 italic">
            {progress >= 100 ? 'Objectif atteint ! ✨' : `Encore CHF ${Math.max(stats.monthlyGoal - stats.currentSpend, 0).toFixed(0)} pour atteindre l'objectif.`}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-derma-black/5 rounded-sm group-hover:bg-derma-black/10 transition-colors">
              <Award className="text-derma-black" size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('dash_tier_status')}</span>
          </div>
          <h3 className="font-serif text-3xl text-derma-black uppercase tracking-wide">
            {user?.tier === UserTier.PREMIUM ? 'Premium ⭐' : 'Standard'}
          </h3>
          <p className="mt-2 text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
            {user?.tier === UserTier.PREMIUM ? 'Remises maximales activées' : 'Passez Premium pour 10% de remise'}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-sm group-hover:bg-blue-100 transition-colors">
              <ShoppingBag className="text-blue-600" size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Commandes Totales</span>
          </div>
          <h3 className="font-serif text-3xl text-derma-black">{stats.ordersCount}</h3>
          <p className="mt-2 text-[10px] text-gray-500 uppercase tracking-widest">Activité depuis l'inscription</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders List */}
        <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-serif text-xl text-derma-black">{t('dash_recent_orders')}</h4>
            <button className="text-[10px] uppercase tracking-widest text-derma-gold font-bold hover:underline flex items-center gap-1">
              {t('dash_view_all')} <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-4">
            {recentOrders.length > 0 ? recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-sm group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-sm flex items-center justify-center text-gray-400 group-hover:text-derma-gold transition-colors">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-derma-black">#{order.id}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <Clock size={10} />
                      <span>{order.date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-derma-black">{order.amount}</p>
                  <span className={`text-[9px] uppercase tracking-tighter px-2 py-0.5 rounded-full font-bold
                                        ${order.status === 'PREPARATION' ? 'bg-orange-50 text-orange-600' :
                      order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}
                                    `}>
                    {order.status}
                  </span>
                </div>
              </div>
            )) : <div className="text-center py-10 text-gray-400 text-sm">Aucune commande récente.</div>}
          </div>
        </div>

        {/* Quick Actions / Tips */}
        <div className="space-y-6">
          <div className="bg-derma-black p-8 rounded-sm text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-derma-gold/10 rounded-bl-full -mr-16 -mt-16"></div>
            <h4 className="font-serif text-2xl mb-2 relative z-10">{t('dash_active_tier_premium')}</h4>
            <p className="text-gray-400 text-sm font-light mb-6 relative z-10">Accédez à des remises exclusives sur toute la gamme Dermakor Swiss.</p>
            <button className="bg-derma-gold text-white px-6 py-2.5 text-xs uppercase tracking-[2px] hover:bg-white hover:text-derma-black transition-all flex items-center gap-2 relative z-10 shadow-lg">
              Passer commande <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-sm">
              <Target size={24} />
            </div>
            <div>
              <h5 className="font-medium text-derma-black text-sm mb-1">{t('dash_monthly_goal')}</h5>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                {t('dash_active_tier_premium')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
