import React from 'react';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'S1', value: 4000 },
  { name: 'S2', value: 3000 },
  { name: 'S3', value: 9800 },
  { name: 'S4', value: 12600 },
  { name: 'S5', value: 15280 },
  { name: 'S6', value: 24500 },
  { name: 'S7', value: 45280 },
];

const AdminDashboard: React.FC = () => {
  
  const StatCard = ({ label, value, change, isPositive, icon: Icon }: any) => (
    <div className="bg-white border border-[#E8E8E8] rounded-lg p-6 hover:border-[#C0A76A] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] transition-all duration-200 group">
      <div className="flex justify-between items-start mb-3">
        <p className="text-[11px] font-medium uppercase tracking-[1px] text-[#6B6B6B]">{label}</p>
        <Icon size={18} className="text-gray-300 group-hover:text-[#C0A76A] transition-colors" />
      </div>
      <h3 className="font-oswald text-[36px] text-[#1A1A1A] leading-none mb-3">{value}</h3>
      <div className={`flex items-center gap-1 text-[13px] font-medium ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        <span>{change}</span>
        <span className="text-[#999999] font-normal ml-1">vs mois dernier</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Date Filter & Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Période:</span>
            <select className="bg-white border border-[#E0E0E0] text-[#1A1A1A] text-sm font-medium py-2 pl-3 pr-8 rounded focus:outline-none focus:border-[#C0A76A] cursor-pointer appearance-none">
                <option>Février 2026</option>
                <option>Janvier 2026</option>
                <option>Année 2025</option>
            </select>
        </div>
        <button className="text-[#1A1A1A] bg-white border border-[#E0E0E0] px-4 py-2 rounded text-[13px] font-medium hover:bg-[#FAFAF8] transition-colors">
            Exporter CSV ↓
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Partenaires Actifs" value="24" change="+2" isPositive={true} icon={Users} />
        <StatCard label="Commandes (Mois)" value="156" change="+18" isPositive={true} icon={ShoppingBag} />
        <StatCard label="Revenus Totaux" value="CHF 45,280" change="+12.5%" isPositive={true} icon={DollarSign} />
        <StatCard label="Panier Moyen" value="CHF 290" change="-1.5%" isPositive={false} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E8E8E8] rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-oswald text-[18px] text-[#1A1A1A] tracking-wide">Évolution Revenus</h3>
            <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C0A76A]"></span> Premium
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span> Standard
                </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C0A76A" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#C0A76A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E8E8" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} />
                <Tooltip 
                    contentStyle={{backgroundColor: '#1A1A1A', border: 'none', borderRadius: '4px', color: '#FFF'}}
                    itemStyle={{color: '#FFF'}}
                    formatter={(value) => [`CHF ${value}`, 'Revenus']}
                    cursor={{stroke: '#C0A76A', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Area type="monotone" dataKey="value" stroke="#C0A76A" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Items & Alerts */}
        <div className="space-y-6">
            <div className="bg-white border border-[#E8E8E8] rounded-lg p-6">
                <h3 className="font-oswald text-[18px] text-[#1A1A1A] tracking-wide mb-4 flex items-center gap-2">
                    <AlertCircle size={18} className="text-[#F59E0B]" /> Actions Requises
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#FAFAF8] rounded border border-[#F5F5F5] hover:border-[#E0E0E0] cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                            <span className="text-[13px] text-[#1A1A1A] font-medium">3 demandes partenaire</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#FAFAF8] rounded border border-[#F5F5F5] hover:border-[#E0E0E0] cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                            <span className="text-[13px] text-[#1A1A1A] font-medium">1 commande annulée</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-[#E8E8E8] rounded-lg p-6">
                 <h3 className="font-oswald text-[18px] text-[#1A1A1A] tracking-wide mb-4">Dernières Commandes</h3>
                 <div className="space-y-4">
                     {[
                         { id: '#1256', name: 'Belle Étoile', amount: 'CHF 1,240', time: '2h', tier: 'P' },
                         { id: '#1255', name: 'Clinique Leman', amount: 'CHF 385', time: '5h', tier: 'S' },
                         { id: '#1254', name: 'Beauty Lab', amount: 'CHF 920', time: '1j', tier: 'P' },
                     ].map((order, i) => (
                         <div key={i} className="flex justify-between items-center pb-3 border-b border-[#F5F5F5] last:border-0 last:pb-0">
                             <div>
                                 <div className="flex items-center gap-2">
                                     <span className="font-mono text-xs font-medium text-[#6B6B6B]">{order.id}</span>
                                     <span className="text-[13px] font-medium text-[#1A1A1A]">{order.name}</span>
                                     {order.tier === 'P' && <span className="text-[9px] text-[#C0A76A] font-bold border border-[#C0A76A] px-1 rounded">P</span>}
                                 </div>
                                 <div className="flex items-center gap-1 text-[11px] text-[#999] mt-0.5">
                                    <Clock size={10} /> Il y a {order.time}
                                 </div>
                             </div>
                             <span className="font-oswald text-[14px] text-[#1A1A1A]">{order.amount}</span>
                         </div>
                     ))}
                 </div>
                 <button className="w-full mt-4 text-[12px] font-medium text-[#6B6B6B] hover:text-[#1A1A1A] flex items-center justify-center gap-1">
                     Voir tout <ArrowUpRight size={12} />
                 </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;