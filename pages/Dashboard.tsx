import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { User, UserTier } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, Calendar } from 'lucide-react';

interface DashboardProps {
  user: User;
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const { t } = useLanguage();

  // Progress Calculation
  const progressPercentage = Math.min(100, (user.currentSpend / user.monthlyGoal) * 100);
  const data = [
    { name: 'Completed', value: user.currentSpend },
    { name: 'Remaining', value: Math.max(0, user.monthlyGoal - user.currentSpend) },
  ];
  
  const COLORS = ['#1a1a1a', '#E2E8F0'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-6 gap-4">
        <div>
            <h2 className="font-serif text-3xl text-derma-black">{t('nav_dashboard')}</h2>
            <p className="text-gray-500 font-light mt-1 text-sm">{t('dash_welcome')} {user.name.split(' ')[1]}</p>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => onNavigate('order')}
                className="px-6 py-2 bg-derma-gold text-white text-xs uppercase tracking-wider hover:bg-[#B08D55] transition-colors shadow-sm"
            >
                {t('nav_order')}
            </button>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Card */}
        <div className="bg-white p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
           <div className="absolute top-0 left-0 w-1 h-full bg-derma-black"></div>
           <div className="flex justify-between items-start mb-4">
               <div>
                   <h3 className="text-xs uppercase tracking-widest text-gray-400">{t('dash_progress_title')}</h3>
                   <div className="text-2xl font-serif text-derma-black mt-2">
                     CHF {user.currentSpend.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                   </div>
                   <div className="text-xs text-derma-gold font-medium mt-1">
                     / CHF {user.monthlyGoal.toLocaleString('de-CH')} {t('dash_min_goal')}
                   </div>
               </div>
               <div className="h-16 w-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={30}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
               </div>
           </div>
           
           <div className="mt-4">
               <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-derma-black transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                   ></div>
               </div>
               <p className="text-[10px] text-gray-400 mt-2 text-right">{progressPercentage.toFixed(0)}% Completed</p>
           </div>
        </div>

        {/* Status Card */}
        <div className="bg-white p-6 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-shadow">
             <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-400">{t('dash_tier_status')}</h3>
                <div className="flex items-center gap-2 mt-3">
                    <span className="font-serif text-2xl text-derma-black capitalize">
                        {user.tier.toLowerCase()}
                    </span>
                    {user.tier === UserTier.PREMIUM && (
                        <span className="bg-derma-gold text-white text-[9px] px-2 py-0.5 uppercase tracking-wide">Elite</span>
                    )}
                </div>
             </div>
             <div className="mt-4 text-sm text-gray-500 leading-relaxed">
                {user.tier === UserTier.STANDARD 
                    ? "Reach CHF 3,000 yearly to unlock Premium Academy resources and priority shipping." 
                    : "You are maintaining Elite status. Enjoy exclusive access to advanced protocols."}
             </div>
        </div>

         {/* Quick Actions / Notifications */}
         <div className="bg-derma-charcoal text-white p-6 shadow-sm flex flex-col justify-between">
            <div>
                 <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Partner Updates</h3>
                 <ul className="space-y-3">
                     <li className="text-sm font-light flex items-start gap-2">
                        <span className="w-1.5 h-1.5 mt-1.5 bg-derma-gold rounded-full flex-shrink-0"></span>
                        <span>New "Green Sea Peel" protocol available in Academy.</span>
                     </li>
                     <li className="text-sm font-light flex items-start gap-2">
                        <span className="w-1.5 h-1.5 mt-1.5 bg-gray-500 rounded-full flex-shrink-0"></span>
                        <span>Restock: Carboxy Gel expected Oct 15.</span>
                     </li>
                 </ul>
            </div>
            <button 
                onClick={() => onNavigate('academy')}
                className="mt-4 text-xs uppercase tracking-wider text-derma-gold hover:text-white transition-colors text-left flex items-center gap-2"
            >
                View Updates <TrendingUp size={14} />
            </button>
         </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-gray-200 shadow-sm mt-8">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-serif text-xl text-derma-black">{t('dash_recent_orders')}</h3>
            <Package size={18} className="text-gray-400" />
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <th className="px-6 py-4">{t('dash_order_id')}</th>
                        <th className="px-6 py-4">{t('dash_date')}</th>
                        <th className="px-6 py-4">{t('dash_amount')}</th>
                        <th className="px-6 py-4">{t('dash_status')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-gray-600">ORD-2023-884</td>
                        <td className="px-6 py-4 text-gray-600">02.10.2023</td>
                        <td className="px-6 py-4 font-medium">CHF 450.00</td>
                        <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Shipped</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-gray-600">ORD-2023-812</td>
                        <td className="px-6 py-4 text-gray-600">15.09.2023</td>
                        <td className="px-6 py-4 font-medium">CHF 1,280.00</td>
                        <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Delivered</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
