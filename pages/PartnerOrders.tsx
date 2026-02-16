import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    Clock,
    Truck,
    CheckCircle,
    XCircle,
    Eye,
    Search,
    ChevronLeft,
    Box,
    MapPin,
    CreditCard,
    Package as PackageIcon,
    ArrowUpRight,
    Globe,
    ExternalLink
} from 'lucide-react';
import { AdminOrder, UserTier } from '../types';
import { supabase } from '../utils/supabase';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';

const PartnerOrders: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

    const fetchOrders = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('partner_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapped: AdminOrder[] = (data || []).map(o => ({
                id: (o.id || '').toString().slice(0, 8).toUpperCase(),
                realId: o.id,
                date: o.created_at ? new Date(o.created_at).toLocaleDateString('fr-CH') : 'N/A',
                partnerName: user.instituteName || 'Mon Institut',
                tier: user.tier as UserTier || UserTier.STANDARD,
                total: Number(o.total_amount || 0),
                status: (o.status || 'PENDING') as any,
                channel: o.channel || 'Online Store',
                paymentStatus: o.payment_status || 'Pagado',
                deliveryStatus: o.delivery_status || 'En attente',
                deliveryMethod: o.delivery_method || 'Standard',
                trackingNumber: o.tracking_number,
                carrier: o.carrier,
                tags: Array.isArray(o.tags) ? o.tags : [],
                itemsCount: Array.isArray(o.items) ? (o.items as any[]).reduce((sum, item) => sum + (item.quantity || 0), 0) : 0,
                items: Array.isArray(o.items) ? o.items : [],
                shippingAddress: user.address || ''
            }));

            setOrders(mapped);
        } catch (err) {
            console.error('Error fetching partner orders:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        // REAL-TIME SUBSCRIPTION
        if (!user) return;

        const channel = supabase
            .channel(`partner-orders-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `partner_id=eq.${user.id}`
                },
                (payload) => {
                    console.log('PartnerOrders: Real-time change detected:', payload);
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'PENDING':
                return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-gray-100 text-gray-500 border border-gray-200"><Clock size={12} /> En attente</span>;
            case 'PREPARATION':
                return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"><Clock size={12} /> En cours</span>;
            case 'SHIPPED':
                return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20"><Truck size={12} /> Expédiée</span>;
            case 'DELIVERED':
                return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"><CheckCircle size={12} /> Livrée</span>;
            case 'CANCELLED':
                return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"><XCircle size={12} /> Annulée</span>;
            default:
                return null;
        }
    };

    const getOrderTotals = (order: AdminOrder) => {
        const items = order.items || [];
        const subTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const vatAmount = subTotal * 0.081;
        const total = order.total;
        return { items, subTotal, vatAmount, total };
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-serif text-3xl text-derma-black leading-tight">Mes Commandes</h1>
                    <p className="text-derma-text-muted mt-2 font-light">Suivez l'état de vos approvisionnements Dermakor.</p>
                </div>
            </div>

            <div className="bg-white border border-derma-border rounded-sm shadow-premium overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#FAFAF8] border-b border-derma-border">
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-derma-text-muted">ID</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-derma-text-muted">Date</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-derma-text-muted">Statut</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-derma-text-muted">Total</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-derma-text-muted">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-derma-border">
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Chargement...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Aucune commande trouvée.</td></tr>
                        ) : orders.map(order => (
                            <tr key={order.realId} className="hover:bg-[#FAFAF8]/50 transition-colors group">
                                <td className="px-6 py-4 text-xs font-bold text-derma-black tracking-widest">#{order.id}</td>
                                <td className="px-6 py-4 text-xs text-derma-text-muted">{order.date}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <StatusBadge status={order.status} />
                                        {order.status === 'SHIPPED' && order.trackingNumber && (
                                            <span className="text-[10px] text-derma-gold font-mono font-bold pl-1">{order.trackingNumber}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right text-xs font-bold text-derma-black">CHF {order.total.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="p-2 border border-derma-border rounded hover:border-derma-gold hover:text-derma-gold transition-colors"
                                    >
                                        <Eye size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* SHOPIFY STYLE MODAL FOR PARTNER */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-10 animate-fade-in">
                    <div className="absolute inset-0 bg-[#0B0B0B]/80 backdrop-blur-md" onClick={() => setSelectedOrder(null)}></div>
                    <div className="bg-[#F6F6F7] w-full max-w-[1200px] h-full md:h-[90vh] rounded-none md:rounded-xl shadow-2xl relative z-10 overflow-hidden flex flex-col animate-slide-up">

                        <div className="bg-white border-b border-[#E3E3E3] px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-[#F1F1F1] rounded-lg transition-colors text-[#5C5F62]">
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <h2 className="font-bold text-lg text-[#202223] tracking-tight">#{selectedOrder.id}</h2>
                                        <StatusBadge status={selectedOrder.status} />
                                    </div>
                                    <span className="text-[12px] text-[#6D7175]">{selectedOrder.date} à 14:24</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="flex flex-col lg:flex-row gap-6 max-w-[1100px] mx-auto">
                                <div className="flex-1 space-y-6">
                                    <div className="bg-white rounded-lg border border-[#E3E3E3] shadow-sm overflow-hidden">
                                        <div className="px-5 py-4 bg-[#F1F1F1]/30 border-b border-[#E3E3E3] flex justify-between items-center">
                                            <h3 className="font-bold text-[14px] text-[#202223]">Détails de l'expédition</h3>
                                            {selectedOrder.status === 'SHIPPED' && (
                                                <span className="text-xs font-bold text-derma-gold">{selectedOrder.carrier}</span>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            {selectedOrder.status === 'SHIPPED' && selectedOrder.trackingNumber ? (
                                                <div className="flex items-center gap-4 p-4 bg-derma-gold/5 border border-derma-gold/10 rounded-lg">
                                                    <Truck className="text-derma-gold" size={24} />
                                                    <div>
                                                        <p className="text-sm font-bold text-derma-black">Votre colis est en route</p>
                                                        <p className="text-xs text-derma-text-muted mt-1">Nº de suivi: <span className="font-mono font-bold text-derma-black">{selectedOrder.trackingNumber}</span></p>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            if (selectedOrder.trackingNumber) {
                                                                window.open(`https://www.post.ch/fr/reception/suivi-des-envois?q=${selectedOrder.trackingNumber}`, '_blank');
                                                            }
                                                        }}
                                                        className="ml-auto flex items-center gap-2 text-xs font-bold text-[#005BD3] hover:underline"
                                                    >
                                                        Suivre <ExternalLink size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">Informations d'expédition bientôt disponibles...</p>
                                            )}

                                            <div className="mt-6 divide-y divide-[#F1F1F1]">
                                                {selectedOrder.items?.map((item, idx) => (
                                                    <div key={idx} className="py-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-gray-50 rounded border border-[#E3E3E3] flex items-center justify-center p-2 relative">
                                                                <PackageIcon size={18} className="text-gray-300" />
                                                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                                                                    {item.quantity}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <p className="text-[13px] font-bold text-[#202223]">{item.name}</p>
                                                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{item.sku}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm font-bold text-[#202223]">CHF {(item.price * item.quantity).toFixed(2)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg border border-[#E3E3E3] shadow-sm p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <CreditCard size={20} className="text-[#5C5F62]" />
                                            <h3 className="font-bold text-[14px] text-[#202223]">Paiement</h3>
                                        </div>
                                        {(() => {
                                            const { subTotal, vatAmount, total } = getOrderTotals(selectedOrder);
                                            return (
                                                <div className="space-y-2 border-t border-[#F1F1F1] pt-4">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-[#6D7175]">Sous-total</span>
                                                        <span className="font-medium">CHF {subTotal.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-[#6D7175]">MwSt 8.1% (inclus)</span>
                                                        <span className="font-medium">CHF {vatAmount.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-lg font-bold text-[#202223] pt-4 mt-2 border-t border-[#F1F1F1]">
                                                        <span>Total</span>
                                                        <span>CHF {total.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div className="w-full lg:w-80 space-y-6">
                                    <div className="bg-white rounded-lg border border-[#E3E3E3] shadow-sm p-5">
                                        <h4 className="font-bold text-[14px] text-[#202223] mb-4">Adresse de livraison</h4>
                                        <p className="text-sm text-[#6D7175] leading-relaxed">
                                            {selectedOrder.partnerName}<br />
                                            {selectedOrder.shippingAddress || 'Adresse non spécifiée'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerOrders;
