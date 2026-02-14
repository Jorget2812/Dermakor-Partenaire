import React, { useState, useEffect } from 'react';
import { Bell, Package, ShoppingBag, Users, DollarSign, X } from 'lucide-react';
import { supabase } from '../utils/supabase';

interface Notification {
    id: string;
    created_at: string;
    type: 'ORDER' | 'STOCK' | 'PARTNER' | 'PAYMENT';
    title: string;
    message: string;
    is_read: boolean;
    link?: string;
}

const NotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Real-time subscription
        const channel = supabase
            .channel('public:notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
                setNotifications(prev => [payload.new as Notification, ...prev.slice(0, 9)]);
                setUnreadCount(prev => prev + 1);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const markAsRead = async (id: string) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'ORDER': return <ShoppingBag size={14} className="text-derma-blue" />;
            case 'STOCK': return <Package size={14} className="text-red-500" />;
            case 'PARTNER': return <Users size={14} className="text-derma-gold" />;
            case 'PAYMENT': return <DollarSign size={14} className="text-[#10B981]" />;
            default: return <Bell size={14} />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-11 h-11 rounded-full bg-white border border-derma-border flex items-center justify-center text-derma-text-muted hover:text-derma-blue hover:border-derma-blue hover:shadow-clinical transition-luxury"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-derma-gold rounded-full text-[9px] font-black text-white flex items-center justify-center border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 bg-white border border-derma-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                        <div className="p-4 border-b border-derma-border flex justify-between items-center bg-derma-bg/30">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-derma-text">Centro de Alertas</h3>
                            <button onClick={() => setIsOpen(false)}><X size={14} className="text-derma-text-muted" /></button>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-10 text-center">
                                    <p className="text-[10px] text-derma-text-muted uppercase font-bold tracking-widest opacity-40">No hay alertas activas</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => markAsRead(n.id)}
                                        className={`p-4 border-b border-derma-border hover:bg-derma-bg/30 transition-colors cursor-pointer relative ${!n.is_read ? 'bg-derma-gold/5' : ''}`}
                                    >
                                        {!n.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-derma-gold"></div>}
                                        <div className="flex gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!n.is_read ? 'bg-white shadow-sm' : 'bg-derma-bg'}`}>
                                                {getIcon(n.type)}
                                            </div>
                                            <div>
                                                <h4 className="text-[12px] font-bold text-derma-text leading-tight">{n.title}</h4>
                                                <p className="text-[11px] text-derma-text-muted mt-1 leading-snug">{n.message}</p>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase mt-2 block tracking-tighter">
                                                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • HUB SUIZA
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 bg-derma-bg/30 text-center border-t border-derma-border">
                            <button className="text-[9px] font-black uppercase tracking-widest text-derma-blue hover:underline">Ver todas las notificaciones</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
