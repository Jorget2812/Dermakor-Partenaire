import React, { useState, useEffect } from 'react';
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
import { supabase } from '../utils/supabase';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        activePartners: 0,
        monthlyOrders: 0,
        totalRevenue: 0,
        totalProfit: 0,
        avgGrossMargin: 0,
        avgBasket: 0,
        targetCoverage: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [topPartners, setTopPartners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const { count: partnersCount } = await supabase
                .from('partner_users')
                .select('*', { count: 'exact', head: true });

            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`id, total_amount, created_at, status, items, partner_users (company_name, tier)`)
                .order('created_at', { ascending: false });

            const { data: productsData } = await supabase.from('products').select('sku, cost_price, name, category, stock_quantity');

            if (!ordersError && ordersData && productsData) {
                const productMap = (productsData || []).reduce((acc: any, p) => {
                    acc[p.sku] = { cost: Number(p.cost_price || 0), name: p.name, category: p.category, stock: p.stock_quantity };
                    return acc;
                }, {});

                let totalRev = 0;
                let totalProfit = 0;
                const productPerformance: any = {};
                const partnerPerformance: any = {};

                const processedOrders = ordersData.map(order => {
                    const items = (order.items || []) as any[];
                    const partnerName = (order.partner_users as any)?.company_name || 'Inconnu';
                    let orderCost = 0;

                    items.forEach(item => {
                        const pData = productMap[item.sku];
                        if (pData) {
                            const itemCost = pData.cost * item.quantity;
                            orderCost += itemCost;
                            if (!productPerformance[item.sku]) {
                                productPerformance[item.sku] = { name: pData.name, revenue: 0, profit: 0, units: 0, category: pData.category };
                            }
                            productPerformance[item.sku].revenue += item.price * item.quantity;
                            productPerformance[item.sku].profit += (item.price - pData.cost) * item.quantity;
                            productPerformance[item.sku].units += item.quantity;
                        }
                    });

                    const revenue = Number(order.total_amount || 0);
                    const orderProfit = revenue - orderCost;
                    totalRev += revenue;
                    totalProfit += orderProfit;

                    if (!partnerPerformance[partnerName]) {
                        partnerPerformance[partnerName] = { profit: 0, revenue: 0, orders: 0 };
                    }
                    partnerPerformance[partnerName].profit += orderProfit;
                    partnerPerformance[partnerName].revenue += revenue;
                    partnerPerformance[partnerName].orders += 1;

                    return { ...order, profit: orderProfit };
                });

                const avgMargin = totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;
                const monthlyTarget = 5000;
                const targetCoverage = (totalRev / monthlyTarget) * 100;

                setStats({
                    activePartners: partnersCount || 0,
                    monthlyOrders: ordersData.length,
                    totalRevenue: totalRev,
                    totalProfit: totalProfit,
                    avgGrossMargin: avgMargin,
                    avgBasket: ordersData.length > 0 ? totalRev / ordersData.length : 0,
                    targetCoverage: Math.min(targetCoverage, 100)
                });

                setTopProducts(Object.entries(productPerformance).map(([sku, data]: any) => ({ sku, ...data })).sort((a, b) => b.profit - a.profit).slice(0, 5));
                setTopPartners(Object.entries(partnerPerformance).map(([name, data]: any) => ({ name, ...data })).sort((a, b) => b.profit - a.profit).slice(0, 5));

                setRecentOrders(processedOrders.slice(0, 5).map(o => ({
                    id: (o.id || '').toString().slice(0, 8).toUpperCase(),
                    name: (o.partner_users as any)?.company_name || 'Inconnu',
                    amount: `CHF ${Number(o.total_amount || 0).toFixed(2)}`,
                    profit: `CHF ${Number(o.profit || 0).toFixed(2)}`,
                    time: o.created_at ? new Date(o.created_at).toLocaleDateString() : 'N/A',
                    tier: (o.partner_users as any)?.tier === 'PREMIUM' ? 'P' : 'S'
                })));

                const grouped = ordersData.reduce((acc: any, o) => {
                    if (!o.created_at) return acc;
                    const date = new Date(o.created_at).toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit' });
                    acc[date] = (acc[date] || 0) + Number(o.total_amount || 0);
                    return acc;
                }, {});
                setChartData(Object.entries(grouped).map(([name, value]) => ({ name, value })).reverse().slice(-7));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const StatCard = ({ label, value, change, isPositive, icon: Icon }: any) => (
        <div className="bg-white border border-derma-border rounded-xl p-8 hover:shadow-clinical transition-luxury group">
            <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-derma-text-muted opacity-60">{label}</p>
                <div className="w-10 h-10 rounded-lg bg-derma-bg flex items-center justify-center text-derma-text-muted group-hover:text-derma-gold transition-colors">
                    <Icon size={20} />
                </div>
            </div>
            <h3 className="font-oswald text-[32px] text-derma-text leading-tight mb-4 tracking-tight">{value}</h3>
            <div className={`flex items-center gap-1.5 text-[12px] font-bold ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                <div className={`px-2 py-0.5 rounded flex items-center gap-1 ${isPositive ? 'bg-[#10B981]/10' : 'bg-[#EF4444]/10'}`}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span>{change}</span>
                </div>
                <span className="text-derma-text-muted font-bold opacity-30 uppercase text-[9px] tracking-widest ml-1">vs prev. month</span>
            </div>
        </div>
    );

    if (isLoading) return <div className="p-20 text-center font-oswald text-derma-text-muted uppercase tracking-[0.3em] animate-pulse">Initializing Executive View...</div>;

    return (
        <div className="space-y-10">
            {/* Strategic Alerts & Notifications Bar */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 bg-white border border-derma-gold/20 rounded-xl p-6 flex items-center gap-6 shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-derma-gold/10 flex items-center justify-center text-derma-gold shrink-0">
                        <TrendingUp size={28} />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-derma-text">Cobertura de Objetivo Mensual</span>
                            <span className="text-sm font-black text-derma-gold">{(stats as any).targetCoverage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-3 bg-derma-bg rounded-full overflow-hidden border border-derma-border">
                            <div
                                className="h-full bg-derma-gold transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(198,167,94,0.3)]"
                                style={{ width: `${(stats as any).targetCoverage}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-derma-text-muted mt-2 font-bold uppercase tracking-widest opacity-60">
                            Objetivo Mandatorio: <span className="text-derma-text">5.000 CHF</span> • Estatus: {(stats as any).targetCoverage >= 100 ? '✅ LOGRADO' : '⏳ EN PROCESO'}
                        </p>
                    </div>
                </div>

                <div className="w-full lg:w-96 bg-[#3E5C76] rounded-xl p-6 flex items-center gap-4 text-white shadow-lg">
                    <AlertCircle size={32} className="text-[#A5C1D9]" />
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70">Alertas de Suministro</h4>
                        <p className="text-[13px] font-bold leading-tight mt-1">3 Productos críticos con stock inferior a 7 días.</p>
                        <button className="text-[10px] font-black uppercase tracking-widest mt-2 underline decoration-derma-gold decoration-2 underline-offset-4">Gestionar Inventario</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard label="Recette Totale" value={`CHF ${stats.totalRevenue.toLocaleString()}`} change="+12.5%" isPositive={true} icon={ShoppingBag} />
                <StatCard label="Bénéfice Net" value={`CHF ${stats.totalProfit.toLocaleString()}`} change="+8.2%" isPositive={true} icon={DollarSign} />
                <StatCard label="Marge Brute" value={`${stats.avgGrossMargin.toFixed(1)}%`} change="+2.4%" isPositive={true} icon={TrendingUp} />
                <StatCard label="Partenaires Actifs" value={stats.activePartners.toString()} change="+3" isPositive={true} icon={Users} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white border border-derma-border rounded-xl p-10 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="font-oswald text-xl text-derma-text tracking-[0.1em] uppercase">Rendimiento Comercial</h3>
                                <p className="text-[10px] text-derma-text-muted uppercase font-bold tracking-[.2em] mt-1">Flujo de facturación por período</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-derma-bg text-derma-text text-[10px] font-bold rounded-md border border-derma-border uppercase tracking-widest">CHF</button>
                                <button className="px-4 py-2 bg-white text-derma-text-muted text-[10px] font-bold rounded-md border border-derma-border uppercase tracking-widest">Unidades</button>
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData.length > 0 ? chartData : [{ name: 'Aucune donnée', value: 0 }]}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C6A75E" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#C6A75E" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#636E72', fontWeight: 'bold' }} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#636E72', fontWeight: 'bold' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E9ECEF', borderRadius: '8px', padding: '15px shadow-lg' }}
                                        itemStyle={{ color: '#1A1A1A', fontSize: '13px', fontWeight: 'bold' }}
                                        labelStyle={{ color: '#636E72', fontSize: '10px', marginBottom: '8px', fontWeight: '900', textTransform: 'uppercase' }}
                                        formatter={(value: any) => [`CHF ${value.toLocaleString()}`, 'Ventes']}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#C6A75E" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white border border-derma-border rounded-xl p-10">
                        <h3 className="font-oswald text-xl text-derma-text tracking-[0.1em] uppercase mb-8">Productos de Alta Rentabilidad</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {topProducts.slice(0, 4).map((product, i) => (
                                <div key={i} className="p-6 bg-derma-bg/30 border border-derma-border rounded-xl flex flex-col justify-between">
                                    <div className="mb-4">
                                        <span className="text-[9px] font-black text-derma-gold uppercase tracking-[0.2em]">{product.category}</span>
                                        <h4 className="text-[15px] font-bold text-derma-text mt-1">{product.name}</h4>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[9px] text-derma-text-muted font-bold uppercase tracking-widest">Beneficio Generado</p>
                                            <span className="text-lg font-oswald text-derma-text">CHF {product.profit.toLocaleString()}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[11px] text-[#10B981] font-black border-b-2 border-[#10B981]/20">+{((product.profit / stats.totalProfit) * 100).toFixed(1)}% Impact</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="bg-white border border-derma-border rounded-xl p-8 shadow-sm">
                        <h3 className="font-oswald text-lg text-derma-text tracking-[0.1em] uppercase mb-2">Estructura de Márgenes</h3>
                        <p className="text-derma-text-muted text-[10px] mb-8 uppercase tracking-[0.2em] font-black opacity-40">Salud Financiera Suiza</p>

                        <div className="space-y-8">
                            <div className="p-5 bg-derma-bg/50 rounded-xl border border-derma-border">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-derma-text-muted uppercase tracking-widest">Marge Médium Global</span>
                                    <span className="text-derma-blue font-black text-sm">{stats.avgGrossMargin.toFixed(1)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-derma-border">
                                    <div className="h-full bg-derma-blue" style={{ width: `${stats.avgGrossMargin}%` }}></div>
                                </div>
                                <p className="text-[9px] text-derma-text-muted mt-3 font-medium flex items-center gap-1.5 italic">
                                    <AlertCircle size={10} /> Consistencia óptima vs mercado premium.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white border border-derma-border rounded-lg text-center">
                                    <span className="block text-[9px] text-derma-text-muted font-black uppercase mb-1 opacity-50">Standard</span>
                                    <span className="text-sm font-black text-derma-text">50% Markup</span>
                                </div>
                                <div className="p-4 bg-white border border-derma-border rounded-lg text-center">
                                    <span className="block text-[9px] text-derma-text-muted font-black uppercase mb-1 opacity-50">Premium</span>
                                    <span className="text-sm font-black text-derma-gold">70% Markup</span>
                                </div>
                            </div>

                            <div className="p-6 bg-derma-blue rounded-xl text-white shadow-md">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] mb-2 opacity-70">Simulación Proyectada</h4>
                                <div className="text-2xl font-oswald mb-4">CHF 100.000 <span className="text-xs font-sans opacity-60">/ mes</span></div>
                                <div className="w-full h-1 bg-white/10 rounded-full mb-4">
                                    <div className="h-full bg-derma-gold w-[34%]"></div>
                                </div>
                                <button className="w-full py-3 bg-white text-derma-blue text-[10px] font-black uppercase tracking-widest rounded shadow-lg hover:shadow-xl transition-luxury">
                                    Plan de Crecimiento
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-derma-border rounded-xl p-8">
                        <h3 className="font-oswald text-lg text-derma-text tracking-[0.1em] uppercase mb-8">Top Partners (Performance)</h3>
                        <div className="space-y-4">
                            {topPartners.map((partner, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-derma-bg/40 rounded-xl border border-transparent hover:border-derma-gold/20 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-derma-blue text-white flex items-center justify-center text-[11px] font-black">
                                            {partner.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-bold text-derma-text leading-tight">{partner.name}</div>
                                            <div className="text-[9px] text-derma-text-muted font-black uppercase tracking-tighter opacity-50">{partner.orders} PEDIDOS</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[14px] font-oswald text-derma-text">CHF {partner.profit.toLocaleString()}</div>
                                        <div className="text-[9px] text-[#10B981] font-black uppercase tracking-tighter">GAIN NET</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-derma-border rounded-xl p-8">
                        <h3 className="font-oswald text-lg text-derma-text tracking-[0.1em] uppercase mb-8">Flujo Reciente</h3>
                        <div className="space-y-5">
                            {recentOrders.map((order, i) => (
                                <div key={i} className="flex justify-between items-center group">
                                    <div className="flex gap-4 items-center">
                                        <div className={`w-2 h-2 rounded-full ${order.tier === 'P' ? 'bg-derma-gold' : 'bg-derma-blue opacity-30'}`}></div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-bold text-derma-text group-hover:text-derma-gold transition-colors">{order.name}</span>
                                            </div>
                                            <div className="text-[9px] text-derma-text-muted font-black uppercase tracking-[0.1em] opacity-50">
                                                ID {order.id} • {order.time}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right font-oswald text-sm text-derma-text">
                                        {order.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-3 text-[10px] font-black uppercase tracking-widest text-derma-text-muted border border-derma-border rounded-lg hover:bg-derma-bg transition-colors">Ver todas las transacciones</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;