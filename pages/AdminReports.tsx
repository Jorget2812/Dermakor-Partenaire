import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Download, Calendar, RefreshCw, Inbox, TrendingUp } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { Partner, Category } from '../types';

const COLORS = ['#1A1A1A', '#C0A76A', '#2C3E50', '#E2E8F0', '#94A3B8', '#F43F5E'];

const AdminReports: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [
                { data: ordersData },
                { data: partnersData },
                { data: productsData },
                { data: categoriesData }
            ] = await Promise.all([
                supabase.from('orders').select('*').order('created_at', { ascending: true }),
                supabase.from('profiles').select('*'),
                supabase.from('products').select('*'),
                supabase.from('categories').select('*')
            ]);

            setOrders(ordersData || []);
            setPartners(partnersData || []);
            setProducts(productsData || []);
            setCategories(categoriesData || []);
        } catch (err) {
            console.error('Error fetching report data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- LOGIC CALCULATIONS ---

    // 1. Total Revenue (Completed orders)
    const validOrders = orders.filter(o => o.status !== 'CANCELLED');
    const totalRevenue = validOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0);

    // 2. Top Product & Product Performance
    const productStats: Record<string, { name: string, units: number, revenue: number }> = {};
    validOrders.forEach(order => {
        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach((item: any) => {
            const sku = item.sku || 'unknown';
            if (!productStats[sku]) {
                productStats[sku] = { name: item.name || sku, units: 0, revenue: 0 };
            }
            productStats[sku].units += (item.quantity || 0);
            productStats[sku].revenue += (item.price || 0) * (item.quantity || 0);
        });
    });

    const sortedProducts = Object.values(productStats).sort((a, b) => b.revenue - a.revenue);
    const topProduct = sortedProducts[0] || { name: '---', units: 0 };
    const top5Products = sortedProducts.slice(0, 5);

    // 3. Top Partner
    const partnerStats: Record<string, { name: string, total: number, tier: string }> = {};
    validOrders.forEach(order => {
        const pId = order.partner_id;
        const partner = partners.find(p => p.id === pId);
        if (!partnerStats[pId]) {
            partnerStats[pId] = {
                name: (partner as any)?.instituteName || (partner as any)?.full_name || (partner as any)?.email || 'Unknown Partner',
                total: 0,
                tier: (partner as any)?.tier || 'STANDARD'
            };
        }
        partnerStats[pId].total += (order.total_amount || 0);
    });

    const sortedPartners = Object.values(partnerStats).sort((a, b) => b.total - a.total);
    const topPartner = sortedPartners[0] || { name: '---', tier: '---' };

    // 4. Sales Data by Month (for BarChart)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const barChartData = monthNames.map(month => ({ name: month, Standard: 0, Premium: 0 }));

    validOrders.forEach(order => {
        const date = new Date(order.created_at);
        const monthIndex = date.getMonth();
        const partner = partners.find(p => p.id === order.partner_id);
        const isPremium = partner?.tier && partner.tier.startsWith('PREMIUM');

        if (isPremium) {
            barChartData[monthIndex].Premium += order.total_amount;
        } else {
            barChartData[monthIndex].Standard += order.total_amount;
        }
    });

    // 5. Sales Data by Category (for PieChart)
    const categoryStats: Record<string, number> = {};
    validOrders.forEach(order => {
        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach((item: any) => {
            // Find product to get its category name
            const product = products.find(p => p.sku === item.sku);
            const catName = product?.category || 'Autres';
            categoryStats[catName] = (categoryStats[catName] || 0) + ((item.price || 0) * (item.quantity || 0));
        });
    });

    const pieChartData = Object.entries(categoryStats).map(([name, value]) => ({ name, value }));

    const handleExportPDF = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full py-20">
                <RefreshCw size={32} className="animate-spin text-derma-gold opacity-50" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in print:p-0">

            {/* Header Controls */}
            <div className="flex justify-between items-center print:hidden">
                <div className="flex items-center gap-2 bg-white border border-[#E0E0E0] rounded px-3 py-2 text-sm shadow-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-[#1A1A1A] font-medium">Performance 2025</span>
                </div>
                <button
                    onClick={handleExportPDF}
                    className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-lg text-[13px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#2C3E50] transition-luxury shadow-lg active:scale-95"
                >
                    <Download size={16} /> Exporter PDF
                </button>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-[#E8E8E8] shadow-soft bg-luxury-gradient">
                    <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-[#6B6B6B] mb-2 leading-none">Revenu Total</h3>
                    <div className="font-oswald text-3xl text-[#1A1A1A] font-bold">
                        CHF {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-[#10B981] font-bold mt-2 flex items-center gap-1">
                        <TrendingUp size={12} /> Basé sur {validOrders.length} commandes
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#E8E8E8] shadow-soft">
                    <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-[#6B6B6B] mb-2 leading-none">Top Produit</h3>
                    <div className="font-oswald text-xl text-[#1A1A1A] font-bold truncate" title={topProduct.name}>
                        {topProduct.name}
                    </div>
                    <div className="text-[11px] text-[#6B6B6B] font-medium mt-2">
                        {topProduct.units} unidades vendues hoy
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#E8E8E8] shadow-soft border-l-4 border-l-derma-gold">
                    <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-[#6B6B6B] mb-2 leading-none">Top Partenaire</h3>
                    <div className="font-oswald text-xl text-[#1A1A1A] font-bold truncate">
                        {topPartner.name}
                    </div>
                    <div className="text-[11px] text-derma-gold font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                        Tier {topPartner.tier} ⭐
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#E8E8E8] shadow-soft">
                    <h3 className="font-oswald text-lg text-[#1A1A1A] mb-8 uppercase tracking-widest font-black">Revenus Mensuels par Tier</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData.slice(0, new Date().getMonth() + 1)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECECE8" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#6B6B6B' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500, fill: '#6B6B6B' }} />
                                <Tooltip
                                    cursor={{ fill: '#F4F4F0' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }} />
                                <Bar dataKey="Premium" stackId="a" fill="#C0A76A" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="Standard" stackId="a" fill="#2C3E50" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Pie */}
                <div className="bg-white p-6 rounded-xl border border-[#E8E8E8] shadow-soft">
                    <h3 className="font-oswald text-lg text-[#1A1A1A] mb-8 uppercase tracking-widest font-black">Ventes par Catégorie</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white border border-[#E8E8E8] rounded-xl shadow-soft overflow-hidden">
                <div className="px-8 py-5 border-b border-[#E8E8E8] bg-[#FAFAF8] flex justify-between items-center">
                    <h3 className="font-oswald text-lg text-[#1A1A1A] uppercase tracking-widest font-black">Performance Produits (Top 5 Revenu)</h3>
                    <span className="text-[10px] font-black text-derma-text-muted uppercase tracking-[0.2em]">Données cumulées</span>
                </div>
                {top5Products.length > 0 ? (
                    <table className="w-full text-left">
                        <thead className="bg-white text-[10px] font-black uppercase tracking-[0.15em] text-[#6B6B6B] border-b border-[#F0F0F0]">
                            <tr>
                                <th className="px-8 py-4">Produit</th>
                                <th className="px-8 py-4 text-right">Unités</th>
                                <th className="px-8 py-4 text-right">Revenu Brut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5F5F5]">
                            {top5Products.map((p, idx) => (
                                <tr key={idx} className="hover:bg-[#FAFAF8] transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-derma-gold/40">0{idx + 1}</span>
                                            <span className="text-[13px] font-bold text-[#1A1A1A] group-hover:text-derma-gold transition-colors">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <span className="px-2 py-1 bg-derma-bg rounded text-[11px] font-bold text-derma-text">{p.units}</span>
                                    </td>
                                    <td className="px-8 py-4 text-right text-[13px] font-black text-[#1A1A1A]">
                                        CHF {p.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="py-20 text-center">
                        <Inbox size={40} className="mx-auto text-derma-text-muted opacity-20 mb-4" />
                        <p className="text-[11px] font-black uppercase text-derma-text-muted tracking-widest">Aucune donnée de vente pour le moment</p>
                    </div>
                )}
            </div>

            {/* Print Specific CSS */}
            <style dangerouslySetInnerHTML={{
                __html: `
         @media print {
           body * { visibility: hidden; }
           .print\\:p-0, .print\\:p-0 * { visibility: visible; }
           .print\\:p-0 {
             position: absolute;
             left: 0;
             top: 0;
             width: 100%;
             padding: 20px !important;
             background: white !important;
           }
           .recharts-responsive-container {
             width: 100% !important;
             height: 300px !important;
           }
         }
       `}} />

        </div>
    );
};

export default AdminReports;