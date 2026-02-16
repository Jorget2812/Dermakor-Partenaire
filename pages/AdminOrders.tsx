import React, { useState, useEffect } from 'react';
import {
    Search,
    Download,
    Eye,
    Clock,
    Truck,
    CheckCircle,
    XCircle,
    X,
    Printer,
    Loader2,
    ChevronLeft,
    MoreHorizontal,
    MapPin,
    User as UserIcon,
    CreditCard,
    Package as PackageIcon,
    ArrowUpRight,
    ArrowRight,
    RotateCcw,
    Edit3,
    History as HistoryIcon,
    FileText,
    Globe,
    Mail
} from 'lucide-react';
import { AdminOrder, UserTier } from '../types';
import { supabase } from '../utils/supabase';

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    // Tracking & Notification states
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier] = useState('Swiss Post');

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            console.log('AdminOrders: Fetching orders with joins...');
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    partner_users (
                        company_name,
                        tier,
                        address
                    ),
                    profiles (
                        email,
                        full_name
                    )
                `, { count: 'exact' })
                .order('created_at', { ascending: false });

            if (error) {
                console.error('AdminOrders: Database fetch error:', error);

                // FALLBACK: Si falla la unión, intentamos traer solo los pedidos
                console.log('AdminOrders: Retrying without joins...');
                const { data: simpleData, error: simpleError } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (simpleError) throw simpleError;

                const mapped: AdminOrder[] = (simpleData || []).map(o => ({
                    id: (o.id || '').toString().slice(0, 8).toUpperCase(),
                    realId: o.id,
                    partnerId: o.partner_id,
                    date: o.created_at ? new Date(o.created_at).toLocaleDateString('fr-CH') : 'N/A',
                    partnerName: o.partner_name || o.partner_id || 'Client Inconnu',
                    tier: UserTier.STANDARD,
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
                    shippingAddress: ''
                }));
                setOrders(mapped);
                return;
            }

            const mapped: AdminOrder[] = (data || []).map(o => ({
                id: (o.id || '').toString().slice(0, 8).toUpperCase(),
                realId: o.id,
                partnerId: o.partner_id,
                date: o.created_at ? new Date(o.created_at).toLocaleDateString('fr-CH') : 'N/A',
                partnerName: o.partner_users?.company_name || o.profiles?.full_name || o.profiles?.email || 'Inconnu',
                tier: o.partner_users?.tier as UserTier || UserTier.STANDARD,
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
                shippingAddress: o.partner_users?.address || ''
            }));

            setOrders(mapped);
        } catch (err) {
            console.error('AdminOrders: Critical Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        // REAL-TIME SUBSCRIPTION
        const channel = supabase
            .channel('orders-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log('AdminOrders: Real-time change detected:', payload);
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredOrders = orders.filter(o => {
        const matchesStatus = filterStatus === 'ALL' ? true : o.status === filterStatus;
        const matchesSearch =
            o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.partnerName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleExportCSV = () => {
        setIsExporting(true);
        try {
            const headers = ['ID', 'Date', 'Partenaire', 'Total (CHF)', 'Statut Paiement', 'Statut Prep', 'Articles', 'Livraison', 'Transporteur', 'Suivi'];
            const rows = filteredOrders.map(o => [
                o.id,
                o.date,
                o.partnerName,
                o.total.toFixed(2),
                o.paymentStatus,
                o.status,
                o.itemsCount,
                o.deliveryStatus,
                o.carrier || '',
                o.trackingNumber || ''
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `commandes_dermakorswiss_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Export Error:', err);
        } finally {
            setIsExporting(false);
        }
    };

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
        const vatRate = 0.081;
        const vatAmount = subTotal * vatRate;
        const shipping = 0;
        const total = subTotal + vatAmount + shipping;

        return { items, subTotal, vatAmount, shipping, total };
    };

    const handleConfirmTracking = () => {
        if (!trackingNumber) return;
        setIsTrackingModalOpen(false);
        setIsEmailPreviewOpen(true);
    };

    const handleMarkAsShipped = async () => {
        if (!selectedOrder) return;

        try {
            const { error } = await supabase
                .from('orders')
                .update({
                    status: 'SHIPPED',
                    tracking_number: trackingNumber,
                    carrier: carrier
                })
                .eq('id', (selectedOrder as any).realId);

            if (error) throw error;

            // INSERT NOTIFICATION FOR THE PARTNER
            if (selectedOrder.partnerId) {
                await supabase.from('notifications').insert({
                    partner_id: selectedOrder.partnerId,
                    title: 'Commande expédiée',
                    message: `Votre commande #${selectedOrder.id} a été expédiée via ${carrier}. Suivi : ${trackingNumber}`,
                    type: 'ORDER_SHIPPED',
                    metadata: {
                        orderId: selectedOrder.id,
                        orderRealId: selectedOrder.realId,
                        trackingNumber,
                        carrier
                    }
                });
            }

            setIsEmailPreviewOpen(false);
            setTrackingNumber('');
            await fetchOrders();
            setSelectedOrder(null);
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la mise à jour des colonnes de suivi. Vérifiez si les colonnes tracking_number et carrier existent.');
        }
    };

    const handleMarkAsDelivered = async () => {
        if (!selectedOrder) return;
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'DELIVERED' })
                .eq('id', (selectedOrder as any).realId);

            if (error) throw error;

            // Notification for delivery
            if (selectedOrder.partnerId) {
                await supabase.from('notifications').insert({
                    partner_id: selectedOrder.partnerId,
                    title: 'Commande livrée',
                    message: `Excellente nouvelle ! Votre commande #${selectedOrder.id} a été livrée.`,
                    type: 'ORDER_DELIVERED',
                    metadata: {
                        orderId: selectedOrder.id,
                        orderRealId: (selectedOrder as any).realId
                    }
                });
            }

            await fetchOrders();
            setSelectedOrder(null);
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la mise à jour du statut en livré');
        }
    };

    const handleCancelOrder = async () => {
        if (!selectedOrder || !window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'CANCELLED' })
                .eq('id', (selectedOrder as any).realId);

            if (error) throw error;

            await fetchOrders();
            setSelectedOrder(null);
        } catch (err) {
            console.error(err);
            alert('Erreur lors de l\'annulation de la commande');
        }
    };

    const handlePrepareOrder = async () => {
        if (!selectedOrder) return;
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'PREPARATION' })
                .eq('id', (selectedOrder as any).realId);

            if (error) throw error;

            await fetchOrders();
            // We keep the modal open but it will update via realtime or re-fetch
            const updated = orders.find(o => (o as any).realId === (selectedOrder as any).realId);
            if (updated) setSelectedOrder(updated);
        } catch (err) {
            console.error(err);
            alert('Erreur lors del pasaje a preparación');
        }
    };

    const handlePrintInvoice = () => {
        setIsPrinting(true);
        setTimeout(() => {
            setIsPrinting(false);
            window.print();
        }, 800);
    };

    return (
        <div className="space-y-6 print:hidden">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterStatus('ALL')}
                        className={`px-4 py-2 rounded text-[13px] font-medium transition-colors ${filterStatus === 'ALL' ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E0E0E0] text-[#1A1A1A] hover:bg-[#FAFAF8]'}`}
                    >
                        Toutes
                    </button>
                    <button
                        onClick={() => setFilterStatus('PENDING')}
                        className={`px-4 py-2 rounded text-[13px] font-medium transition-colors ${filterStatus === 'PENDING' ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E0E0E0] text-[#1A1A1A] hover:bg-[#FAFAF8]'}`}
                    >
                        En attente
                    </button>
                    <button
                        onClick={() => setFilterStatus('PREPARATION')}
                        className={`px-4 py-2 rounded text-[13px] font-medium transition-colors ${filterStatus === 'PREPARATION' ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E0E0E0] text-[#1A1A1A] hover:bg-[#FAFAF8]'}`}
                    >
                        En cours
                    </button>
                    <button
                        onClick={handleExportCSV}
                        disabled={isExporting}
                        className="bg-white border border-[#E0E0E0] text-[#1A1A1A] px-4 py-2 rounded text-[13px] font-medium flex items-center gap-2 hover:bg-[#FAFAF8] disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        Exporter
                    </button>
                </div>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Recherche commande, partenaire..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white border border-[#E0E0E0] rounded text-sm w-64 focus:outline-none focus:border-[#1A1A1A]"
                    />
                </div>
            </div>

            <div className="bg-white border border-[#E8E8E8] rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[#C0A76A]/10 border-b-2 border-[#C0A76A] text-[11px] uppercase tracking-[0.2em] text-[#1A1A1A] font-bold">
                        <tr>
                            <th className="px-6 py-4">Commande #</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4 text-right">Total</th>
                            <th className="px-6 py-4">Estado del pago</th>
                            <th className="px-6 py-4">Estado de preparación</th>
                            <th className="px-6 py-4 text-center">Artículos</th>
                            <th className="px-6 py-4">Estado de la entrega</th>
                            <th className="px-6 py-4">Forma de entrega</th>
                            <th className="px-6 py-4">Etiquetas</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F5F5]">
                        {filteredOrders.map(order => (
                            <tr key={order.id} className="hover:bg-[#FAFAF8] transition-colors group">
                                <td className="px-6 py-4 font-mono font-medium text-[#1A1A1A]">{order.id}</td>
                                <td className="px-6 py-4 text-sm text-[#6B6B6B]">{order.date}</td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-[#1A1A1A]">{order.partnerName}</div>
                                    {order.tier === UserTier.PREMIUM && <span className="text-[10px] text-[#C0A76A] font-bold">Premium</span>}
                                </td>
                                <td className="px-6 py-4 text-right font-oswald text-[#1A1A1A]">CHF {order.total.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                                        {order.paymentStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                                <td className="px-6 py-4 text-center text-sm text-[#6B6B6B]">{order.itemsCount} artículos</td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-gray-100 text-gray-600">
                                        {order.deliveryStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-[#6B6B6B] whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]" title={order.deliveryMethod}>
                                    {order.deliveryMethod}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-1">
                                        {order.tags.map((tag, idx) => (
                                            <span key={idx} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded">{tag}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="p-2 border border-[#E0E0E0] rounded bg-white hover:border-[#1A1A1A] hover:text-[#1A1A1A] text-gray-400 transition-colors"
                                    >
                                        <Eye size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-10 animate-fade-in">
                    <div className="absolute inset-0 bg-[#0B0B0B]/80 backdrop-blur-md" onClick={() => setSelectedOrder(null)}></div>

                    <div className="bg-[#F6F6F7] w-full max-w-[1200px] h-full md:h-[90vh] rounded-none md:rounded-xl shadow-2xl relative z-10 overflow-hidden flex flex-col animate-slide-up">

                        {/* SHOPIFY HEADER */}
                        <div className="bg-white border-b border-[#E3E3E3] px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-2 hover:bg-[#F1F1F1] rounded-lg transition-colors text-[#5C5F62]"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <h2 className="font-bold text-lg text-[#202223] tracking-tight">#{selectedOrder.id}</h2>
                                        <div className="flex gap-2">
                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E3E3E3] text-[#202223] border border-black/5 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> {selectedOrder.paymentStatus}
                                            </span>
                                            <StatusBadge status={selectedOrder.status} />
                                            {selectedOrder.status === 'SHIPPED' && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-[#202223] border border-[#E3E3E3]">
                                                    Archivé
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[12px] text-[#6D7175]">{selectedOrder.date} à 14:24 de Tienda online</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1.5 text-xs font-semibold text-[#202223] hover:bg-[#F1F1F1] rounded-lg border border-[#BABFC3] transition-all">Reembolsar</button>
                                <button className="px-3 py-1.5 text-xs font-semibold text-[#202223] hover:bg-[#F1F1F1] rounded-lg border border-[#BABFC3] transition-all">Devolver</button>
                                <button className="px-3 py-1.5 text-xs font-semibold text-[#202223] hover:bg-[#F1F1F1] rounded-lg border border-[#BABFC3] transition-all flex items-center gap-2">
                                    <Edit3 size={14} /> Editar
                                </button>
                                <div className="relative group">
                                    <button className="px-3 py-1.5 text-xs font-semibold text-[#202223] hover:bg-[#F1F1F1] rounded-lg border border-[#BABFC3] transition-all flex items-center gap-2">
                                        Más acciones <MoreHorizontal size={14} />
                                    </button>
                                    <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[#E3E3E3] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                                        <div className="p-2 border-b border-[#F1F1F1]">
                                            <div className="relative">
                                                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input type="text" placeholder="Buscar acciones" className="w-full pl-7 pr-3 py-1.5 bg-[#F6F6F7] rounded border-none text-[11px] outline-none" />
                                            </div>
                                        </div>
                                        <div className="p-1 space-y-0.5">
                                            <p className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Imprimir</p>
                                            <button onClick={handlePrintInvoice} className="w-full text-left px-3 py-2 text-xs hover:bg-[#F1F1F1] rounded flex items-center gap-3">
                                                <Printer size={14} className="text-gray-500" /> Order Printer
                                            </button>
                                            <button className="w-full text-left px-3 py-2 text-xs hover:bg-[#F1F1F1] rounded flex items-center gap-3">
                                                <FileText size={14} className="text-gray-500" /> Imprimir página del pedido
                                            </button>
                                            <div className="h-px bg-[#F1F1F1] my-1"></div>
                                            <p className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Más acciones</p>
                                            <button className="w-full text-left px-3 py-2 text-xs hover:bg-[#F1F1F1] rounded flex items-center gap-3">
                                                <ArrowRight size={14} className="text-gray-500" /> Duplicar
                                            </button>
                                            <button className="w-full text-left px-3 py-2 text-xs hover:bg-[#F1F1F1] rounded flex items-center gap-3">
                                                <HistoryIcon size={14} className="text-gray-500" /> Desarchivar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-6 w-px bg-[#E3E3E3] mx-2"></div>
                                <div className="flex gap-1">
                                    <button className="p-1.5 hover:bg-[#F1F1F1] rounded border border-[#E3E3E3]"><ChevronLeft size={14} /></button>
                                    <button className="p-1.5 hover:bg-[#F1F1F1] rounded border border-[#E3E3E3] rotate-180"><ChevronLeft size={14} /></button>
                                </div>
                            </div>
                        </div>

                        {/* SHOPIFY MAIN SCROLLABLE AREA */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            <div className="flex flex-col lg:flex-row gap-6 max-w-[1100px] mx-auto">

                                {/* LEFT COLUMN */}
                                <div className="flex-1 space-y-6">

                                    {/* FULFILLMENT CARD */}
                                    <div className="bg-white rounded-lg border border-[#E3E3E3] shadow-sm overflow-hidden">
                                        <div className="px-5 py-4 bg-[#F1F1F1]/30 border-b border-[#E3E3E3] flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg border border-[#E3E3E3]">
                                                    <PackageIcon size={20} className="text-[#5C5F62]" />
                                                </div>
                                                <h3 className="font-bold text-[14px] text-[#202223]">Preparados ({selectedOrder.itemsCount})</h3>
                                            </div>
                                            <div className="flex gap-2 text-[#6D7175]">
                                                <span className="text-sm font-mono text-[#202223]/30">#{selectedOrder.id}-F1</span>
                                                <MoreHorizontal size={16} className="cursor-pointer hover:text-[#202223]" />
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="flex items-start gap-4 text-sm text-[#202223]">
                                                <Clock size={18} className="text-[#6D7175] mt-0.5" />
                                                <div>
                                                    <p className="font-semibold">{selectedOrder.date}</p>
                                                    {selectedOrder.trackingNumber ? (
                                                        <p className="text-[#6D7175] text-xs mt-1">Seguimiento de {selectedOrder.carrier}: <span className="text-[#005BD3] underline cursor-pointer">{selectedOrder.trackingNumber}</span></p>
                                                    ) : (
                                                        <p className="text-[#6D7175] text-xs mt-1 italic">Aucune information de suivi disponible</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="divide-y divide-[#F1F1F1]">
                                                {(selectedOrder.items || []).map((item, idx) => (
                                                    <div key={idx} className="py-4 flex items-center justify-between group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-16 h-16 bg-[#F9F9FB] rounded-lg border border-[#E3E3E3] flex items-center justify-center p-2 relative overflow-hidden group-hover:border-[#BABFC3] transition-all">
                                                                <PackageIcon size={24} className="text-[#BABFC3]" />
                                                                <div className="absolute top-0 right-0 w-5 h-5 bg-[#6D7175] text-white text-[10px] flex items-center justify-center rounded-bl-lg font-bold">
                                                                    {item.quantity}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <p className="text-[14px] font-bold text-[#005BD3] hover:underline cursor-pointer">{item.name}</p>
                                                                <p className="text-xs text-[#6D7175] font-mono mt-1">{item.sku}</p>
                                                                <div className="mt-1 flex items-center gap-2">
                                                                    <span className="text-[10px] font-black bg-[#F1F1F1] px-1.5 py-0.5 rounded text-[#202223]/60 uppercase tracking-tighter">STOCK OK</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[14px] font-bold text-[#202223]">CHF {item.price.toFixed(2)} <span className="text-[#6D7175] font-normal text-xs">× {item.quantity}</span></p>
                                                            <p className="text-sm font-bold text-[#202223] mt-1">CHF {(item.price * item.quantity).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* PAYMENT SUMMARY CARD */}
                                    <div className="bg-white rounded-lg border border-[#E3E3E3] shadow-sm overflow-hidden">
                                        <div className="px-5 py-4 bg-[#F1F1F1]/30 border-b border-[#E3E3E3] flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg border border-[#E3E3E3]">
                                                <CreditCard size={20} className="text-[#5C5F62]" />
                                            </div>
                                            <h3 className="font-bold text-[14px] text-[#202223]">Pagado</h3>
                                        </div>
                                        <div className="p-6">
                                            {(() => {
                                                const { subTotal, vatAmount, total } = getOrderTotals(selectedOrder);
                                                return (
                                                    <div className="space-y-4">
                                                        <div className="space-y-2 border-b border-[#F1F1F1] pb-4">
                                                            <div className="flex justify-between text-sm text-[#202223]">
                                                                <span>Subtotal</span>
                                                                <span>{selectedOrder.itemsCount} artículos</span>
                                                                <span className="font-medium text-right">CHF {subTotal.toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm text-[#202223]">
                                                                <span>Envío</span>
                                                                <span className="text-[#6D7175]">Livraison gratuite dès 300 CHF d'achat</span>
                                                                <span className="font-medium">CHF 0.00</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm text-[#202223]">
                                                                <span>Impuestos</span>
                                                                <span className="text-[#6D7175]">MwSt 8.1% (incluido)</span>
                                                                <span className="font-medium">CHF {vatAmount.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2">
                                                            <span className="font-bold text-lg text-[#202223]">Total</span>
                                                            <div className="text-right">
                                                                <span className="font-bold text-lg text-[#202223]">CHF {total.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="pt-4 border-t border-[#F1F1F1] flex justify-between text-xs font-bold text-[#6D7175] uppercase tracking-widest">
                                                            <span>Pagado por el cliente</span>
                                                            <span>CHF {total.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* FOOTER ACTION (Preparar/Expedir/Entregar pedido) */}
                                    <div className="flex justify-end gap-3 pt-6 pb-20">
                                        {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'DELIVERED' && (
                                            <button
                                                onClick={handleCancelOrder}
                                                className="px-4 py-2 bg-white border border-[#BABFC3] rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 hover:border-red-600 transition-colors"
                                            >
                                                Annuler la commande
                                            </button>
                                        )}

                                        {selectedOrder.status === 'PENDING' && (
                                            <button
                                                onClick={handlePrepareOrder}
                                                className="px-6 py-2 bg-[#202223] text-white rounded-lg text-sm font-bold hover:bg-[#323232] shadow-sm flex items-center gap-2"
                                            >
                                                <PackageIcon size={16} /> Préparer la commande
                                            </button>
                                        )}

                                        {selectedOrder.status === 'PREPARATION' && (
                                            <button
                                                onClick={() => setIsTrackingModalOpen(true)}
                                                className="px-6 py-2 bg-[#005BD3] text-white rounded-lg text-sm font-bold hover:bg-[#004bb4] shadow-sm flex items-center gap-2"
                                            >
                                                <Truck size={16} /> Expédier la commande
                                            </button>
                                        )}

                                        {selectedOrder.status === 'SHIPPED' && (
                                            <button
                                                onClick={handleMarkAsDelivered}
                                                className="px-6 py-2 bg-[#10B981] text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-[#059669]"
                                            >
                                                <CheckCircle size={16} /> Confirmer la livraison
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* RIGHT COLUMN (SIDEBAR) */}
                                <div className="w-full lg:w-80 space-y-6">

                                    {/* NOTES CARD */}
                                    <div className="bg-white rounded-lg border border-[#E3E3E3] shadow-sm p-5">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-[14px] text-[#202223]">Notas</h4>
                                            <Edit3 size={16} className="text-[#005BD3] cursor-pointer" />
                                        </div>
                                        <p className="text-sm text-[#6D7175] italic leading-relaxed">No hay notas del cliente</p>
                                    </div>

                                    {/* CUSTOMER CARD */}
                                    <div className="bg-white rounded-lg border border-[#E3E3E3] shadow-sm overflow-hidden">
                                        <div className="p-5 border-b border-[#F1F1F1]">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-bold text-[14px] text-[#202223]">Cliente</h4>
                                                <X size={16} className="text-gray-400 cursor-pointer" />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex flex-col">
                                                    <p className="text-[#005BD3] font-bold text-[14px] hover:underline cursor-pointer">{selectedOrder.partnerName}</p>
                                                    <p className="text-sm text-[#6D7175] mt-1">3 pedidos</p>
                                                    <p onClick={() => { }} className="text-xs text-[#005BD3] mt-2 cursor-pointer font-semibold uppercase tracking-wider">Mostrar nota de cliente</p>
                                                </div>

                                                <div className="pt-4 border-t border-[#F1F1F1]">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h5 className="text-[12px] font-bold text-[#202223] uppercase tracking-widest opacity-60">Información de contacto</h5>
                                                        <Edit3 size={14} className="text-[#005BD3] cursor-pointer" />
                                                    </div>
                                                    <p className="text-[14px] text-[#005BD3] hover:underline cursor-pointer truncate">jorge@dermakorswiss.com</p>
                                                </div>

                                                <div className="pt-4 border-t border-[#F1F1F1]">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h5 className="text-[12px] font-bold text-[#202223] uppercase tracking-widest opacity-60">Dirección de envío</h5>
                                                        <Edit3 size={14} className="text-[#005BD3] cursor-pointer" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-[#202223] font-medium leading-relaxed">{selectedOrder.partnerName}</p>
                                                        <p className="text-sm text-[#6D7175] leading-relaxed">{selectedOrder.shippingAddress || 'Sardonastrasse 5, 7000 Chur, Suiza'}</p>
                                                        <p className="text-sm text-[#6D7175]">+41 79 309 94 21</p>
                                                        <a href="https://maps.google.com" target="_blank" className="text-xs text-[#005BD3] font-bold mt-2 inline-block">Ver mapa</a>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-[#F1F1F1]">
                                                    <h5 className="text-[12px] font-bold text-[#202223] uppercase tracking-widest opacity-60 mb-2">Dirección de facturación</h5>
                                                    <p className="text-sm text-[#6D7175] italic">Igual que la dirección de envío</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CONVERSION SUMMARY */}
                                    <div className="bg-white rounded-lg border border-[#E3E3E3] shadow-sm p-5">
                                        <h4 className="font-bold text-[14px] text-[#202223] mb-4">Résumé de la conversion</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-1.5 bg-[#F1F1F1] rounded text-[#6D7175]">
                                                    <PackageIcon size={14} />
                                                </div>
                                                <p className="text-[13px] text-[#202223]">C'est sa 3ème commande</p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-1.5 bg-[#F1F1F1] rounded text-[#6D7175]">
                                                    <Globe size={14} />
                                                </div>
                                                <p className="text-[13px] text-[#202223]">Première session de <span className="font-bold">Google</span></p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-1.5 bg-[#F1F1F1] rounded text-[#6D7175]">
                                                    <Clock size={14} />
                                                </div>
                                                <p className="text-[13px] text-[#202223]">11 sessions en 15 jours</p>
                                            </div>
                                            <p className="text-xs text-[#005BD3] font-bold pt-2 cursor-pointer">Voir les détails de conversion</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* TRACKING MODAL */}
            {isTrackingModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsTrackingModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl relative z-10 overflow-hidden animate-slide-up">
                        <div className="p-6 border-b border-[#F1F1F1]">
                            <h3 className="font-bold text-lg text-[#202223]">Información de envío</h3>
                            <p className="text-sm text-[#6D7175] mt-1">Introduce los detalles para que el socio pueda rastrear su pedido.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#202223] uppercase tracking-widest mb-2">Transportista</label>
                                <select
                                    value={carrier}
                                    onChange={(e) => setCarrier(e.target.value)}
                                    className="w-full p-3 bg-[#F6F6F7] border border-[#E3E3E3] rounded-lg text-sm outline-none focus:border-[#202223]"
                                >
                                    <option value="Swiss Post">Swiss Post</option>
                                    <option value="DHL">DHL</option>
                                    <option value="FedEx">FedEx</option>
                                    <option value="UPS">UPS</option>
                                    <option value="Planzer">Planzer</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#202223] uppercase tracking-widest mb-2">Número de seguimiento</label>
                                <div className="relative">
                                    <PackageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Ej: 99.00.123456.78"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-[#F6F6F7] border border-[#E3E3E3] rounded-lg text-sm font-mono outline-none focus:border-[#202223]"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-[#F6F6F7] border-t border-[#E3E3E3] flex justify-end gap-3">
                            <button
                                onClick={() => setIsTrackingModalOpen(false)}
                                className="px-4 py-2 text-sm font-bold text-[#202223] hover:bg-[#F1F1F1] rounded-lg border border-[#BABFC3]"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmTracking}
                                disabled={!trackingNumber}
                                className={`px-6 py-2 bg-[#202223] text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 ${!trackingNumber ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#323232]'}`}
                            >
                                <ArrowRight size={16} /> Suivant
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EMAIL PREVIEW MODAL */}
            {isEmailPreviewOpen && selectedOrder && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsEmailPreviewOpen(false)}></div>
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl relative z-10 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-[#F1F1F1] flex justify-between items-center bg-[#F6F6F7]">
                            <div>
                                <h3 className="font-bold text-lg text-[#202223]">Aperçu de la notification</h3>
                                <p className="text-xs text-[#6D7175]">Le partenaire recevra cet email suite à l'expédition.</p>
                            </div>
                            <button onClick={() => setIsEmailPreviewOpen(false)} className="text-gray-400 hover:text-black">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm max-w-[500px] mx-auto overflow-hidden">
                                <div className="p-8 border-b border-gray-100 text-center">
                                    <h1 className="text-2xl font-oswald uppercase tracking-[0.2em] text-[#1A1A1A]">Dermakor Swiss</h1>
                                </div>
                                <div className="p-8 space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900">Votre commande est en route !</h2>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Bonjour <strong>{selectedOrder.partnerName}</strong>,<br /><br />
                                        Bonne nouvelle ! Votre commande <strong>#{selectedOrder.id}</strong> a été expédiée et elle est en route vers vous.
                                    </p>

                                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Détails de l'expédition</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Transporteur :</span>
                                                <span className="font-bold text-gray-900">{carrier}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Numéro de suivi :</span>
                                                <span className="font-mono font-bold text-[#005BD3]">{trackingNumber}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center pt-4">
                                        <button className="bg-[#1A1A1A] text-white px-8 py-3 rounded-lg text-sm font-bold hover:bg-black transition-all shadow-md">
                                            Suivre mon colis
                                        </button>
                                    </div>

                                    <p className="text-xs text-center text-gray-400 pt-6">
                                        Merci de votre confiance,<br />
                                        L'équipe Dermakor Swiss
                                    </p>
                                </div>
                                <div className="bg-[#1A1A1A] p-4 text-center">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Excellence en Médecine Esthétique</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-[#F6F6F7] border-t border-[#E3E3E3] flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsEmailPreviewOpen(false);
                                    setIsTrackingModalOpen(true);
                                }}
                                className="px-4 py-2 text-sm font-bold text-[#202223] hover:bg-[#F1F1F1] rounded-lg border border-[#BABFC3]"
                            >
                                Modifier infos
                            </button>
                            <button
                                onClick={handleMarkAsShipped}
                                className="px-8 py-2 bg-[#202223] text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-[#323232]"
                            >
                                <Mail size={16} /> Envoyer et Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;