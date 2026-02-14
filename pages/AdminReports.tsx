import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { Download, Calendar } from 'lucide-react';

const SALES_DATA = [
  { name: 'Jan', Standard: 4000, Premium: 2400 },
  { name: 'Feb', Standard: 3000, Premium: 1398 },
  { name: 'Mar', Standard: 2000, Premium: 9800 },
  { name: 'Apr', Standard: 2780, Premium: 3908 },
  { name: 'May', Standard: 1890, Premium: 4800 },
  { name: 'Jun', Standard: 2390, Premium: 3800 },
];

const CATEGORY_DATA = [
  { name: 'Peeling', value: 400 },
  { name: 'Sérum', value: 300 },
  { name: 'Crème', value: 300 },
  { name: 'Masques', value: 200 },
];

const COLORS = ['#1A1A1A', '#C0A76A', '#2C3E50', '#E2E8F0'];

const AdminReports: React.FC = () => {
  return (
    <div className="space-y-8">
       
       {/* Header Controls */}
       <div className="flex justify-between items-center">
           <div className="flex items-center gap-2 bg-white border border-[#E0E0E0] rounded px-3 py-2 text-sm">
               <Calendar size={16} className="text-gray-400" />
               <span className="text-[#1A1A1A] font-medium">Cette année (2025)</span>
           </div>
           <button className="bg-[#1A1A1A] text-white px-4 py-2 rounded text-[13px] font-semibold flex items-center gap-2 hover:bg-[#2C3E50] transition-colors">
               <Download size={16} /> Exporter PDF
           </button>
       </div>

       {/* Top Metrics Row */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-lg border border-[#E8E8E8]">
               <h3 className="text-xs uppercase tracking-widest text-[#6B6B6B] mb-2">Revenu Total</h3>
               <div className="font-oswald text-3xl text-[#1A1A1A]">CHF 145,280</div>
               <div className="text-sm text-[#10B981] mt-1">↑ 12% vs année préc.</div>
           </div>
           <div className="bg-white p-6 rounded-lg border border-[#E8E8E8]">
               <h3 className="text-xs uppercase tracking-widest text-[#6B6B6B] mb-2">Top Produit</h3>
               <div className="font-oswald text-xl text-[#1A1A1A]">Meso Booster Boto-RX</div>
               <div className="text-sm text-[#6B6B6B] mt-1">452 unités vendues</div>
           </div>
           <div className="bg-white p-6 rounded-lg border border-[#E8E8E8]">
               <h3 className="text-xs uppercase tracking-widest text-[#6B6B6B] mb-2">Top Partenaire</h3>
               <div className="font-oswald text-xl text-[#1A1A1A]">Institut Belle Étoile</div>
               <div className="text-sm text-[#C0A76A] mt-1">Tier Premium ⭐</div>
           </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Revenue Chart */}
           <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-[#E8E8E8]">
               <h3 className="font-oswald text-lg text-[#1A1A1A] mb-6">Revenus par Tier</h3>
               <div className="h-80">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={SALES_DATA}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                           <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                           <Tooltip cursor={{fill: '#FAFAF8'}} />
                           <Legend />
                           <Bar dataKey="Premium" stackId="a" fill="#C0A76A" />
                           <Bar dataKey="Standard" stackId="a" fill="#2C3E50" />
                       </BarChart>
                   </ResponsiveContainer>
               </div>
           </div>

           {/* Category Pie */}
           <div className="bg-white p-6 rounded-lg border border-[#E8E8E8]">
               <h3 className="font-oswald text-lg text-[#1A1A1A] mb-6">Ventes par Catégorie</h3>
               <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie
                               data={CATEGORY_DATA}
                               innerRadius={60}
                               outerRadius={80}
                               paddingAngle={5}
                               dataKey="value"
                           >
                               {CATEGORY_DATA.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                               ))}
                           </Pie>
                           <Tooltip />
                           <Legend verticalAlign="bottom" height={36}/>
                       </PieChart>
                   </ResponsiveContainer>
               </div>
           </div>
       </div>

       {/* Top Products Table */}
       <div className="bg-white border border-[#E8E8E8] rounded-lg overflow-hidden">
           <div className="px-6 py-4 border-b border-[#E8E8E8]">
               <h3 className="font-oswald text-lg text-[#1A1A1A]">Performance Produits (Top 5)</h3>
           </div>
           <table className="w-full text-left">
               <thead className="bg-[#FAFAF8] text-[10px] uppercase tracking-wider text-[#6B6B6B]">
                   <tr>
                       <th className="px-6 py-3">Produit</th>
                       <th className="px-6 py-3 text-right">Unités</th>
                       <th className="px-6 py-3 text-right">Revenu</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-[#F5F5F5]">
                   <tr>
                       <td className="px-6 py-3 text-sm font-medium">Meso Booster Boto-RX</td>
                       <td className="px-6 py-3 text-right text-sm">452</td>
                       <td className="px-6 py-3 text-right font-mono text-sm">CHF 49,720</td>
                   </tr>
                   <tr>
                       <td className="px-6 py-3 text-sm font-medium">Derma Shield SPF50</td>
                       <td className="px-6 py-3 text-right text-sm">380</td>
                       <td className="px-6 py-3 text-right font-mono text-sm">CHF 19,000</td>
                   </tr>
                   <tr>
                       <td className="px-6 py-3 text-sm font-medium">Carboxy Therapy CO2</td>
                       <td className="px-6 py-3 text-right text-sm">210</td>
                       <td className="px-6 py-3 text-right font-mono text-sm">CHF 33,600</td>
                   </tr>
                   <tr>
                       <td className="px-6 py-3 text-sm font-medium">Peptide Serum</td>
                       <td className="px-6 py-3 text-right text-sm">185</td>
                       <td className="px-6 py-3 text-right font-mono text-sm">CHF 8,325</td>
                   </tr>
                   <tr>
                       <td className="px-6 py-3 text-sm font-medium">Green Sea Peel</td>
                       <td className="px-6 py-3 text-right text-sm">140</td>
                       <td className="px-6 py-3 text-right font-mono text-sm">CHF 18,200</td>
                   </tr>
               </tbody>
           </table>
       </div>

    </div>
  );
};

export default AdminReports;