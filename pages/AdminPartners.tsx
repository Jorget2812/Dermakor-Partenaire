import React, { useState, useEffect } from 'react';
import {
    Search,
    MoreHorizontal,
    Filter,
    Download,
    Plus,
    User,
    Mail,
    MapPin,
    Calendar,
    X,
    Check,
    XCircle,
    Eye,
    ChevronRight,
    Building2,
    ShieldCheck,
    Clock
} from 'lucide-react';
import { UserTier, Partner, AdminPage } from '../types';
import { supabase } from '../utils/supabase';

interface AdminPartnersProps {
    onNavigate: (page: AdminPage) => void;
}

const AdminPartners: React.FC<AdminPartnersProps> = ({ onNavigate }) => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

    const fetchPartners = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('partner_users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mappedPartners: Partner[] = (data || []).map(p => ({
                id: p.id,
                instituteName: p.company_name || 'Sans nom',
                contactName: p.contact_name || 'Non spécifié',
                email: p.email || '',
                location: p.address || 'Non spécifié',
                tier: (p.tier as UserTier) || UserTier.STANDARD,
                joinDate: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-CH') : 'N/A',
                status: (p.status || 'PENDING').toUpperCase() as any,
                monthlySpend: 0
            }));

            setPartners(mappedPartners);
        } catch (error) {
            console.error('Error fetching partners:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const filteredPartners = partners.filter(p => {
        const matchesSearch = (p.instituteName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.contactName || '').toLowerCase().includes(searchTerm.toLowerCase());

        let matchesFilter = activeFilter === 'ALL' || p.status === activeFilter;
        // Map 'ACTIVE' to 'APPROVED' for filtering if necessary
        if (activeFilter === 'APPROVED' && p.status === 'ACTIVE') matchesFilter = true;

        return matchesSearch && matchesFilter;
    });

    const handleUpdateStatus = async (partnerId: string, status: 'approved' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('partner_users')
                .update({ status: status.toUpperCase() })
                .eq('id', partnerId);

            if (error) throw error;

            // Placeholder for email notification
            console.log(`Sending ${status} email to partner ${partnerId}`);

            await fetchPartners();
            if (selectedPartner?.id === partnerId) {
                setSelectedPartner(null);
            }
        } catch (error) {
            console.error(`Error updating partner status to ${status}:`, error);
            alert(`Erreur lors de la mise à jour: ${status}`);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
            REJECTED: 'bg-rose-50 text-rose-600 border-rose-100',
        }[status] || 'bg-gray-50 text-gray-500 border-gray-100';

        const labels = {
            APPROVED: 'Approuvé',
            ACTIVE: 'Actif',
            PENDING: 'En Attente',
            REJECTED: 'Refusé'
        }[status] || status;

        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles}`}>
                {labels}
            </span>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 bg-[#FAFAF8] min-h-screen p-2">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="font-oswald text-2xl text-derma-black uppercase tracking-tight">Gestion des Partenaires</h2>
                    <p className="text-gray-400 text-xs font-light tracking-wide">Administrez et validez les accès au portail élite.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {/* Export Logic */ }}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-derma-border rounded text-[11px] font-bold uppercase tracking-widest text-derma-black hover:bg-gray-50 transition-all"
                    >
                        <Download size={14} /> Exporter CSV
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-derma-black text-white rounded text-[11px] font-bold uppercase tracking-widest hover:bg-derma-gold transition-all shadow-lg">
                        <Plus size={14} /> Nouveau Socio
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-4 rounded-lg border border-derma-border shadow-sm">
                <div className="flex gap-1 bg-[#FAFAF8] p-1 rounded-lg border border-derma-border">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter as any)}
                            className={`px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${activeFilter === filter
                                    ? 'bg-white text-derma-black shadow-sm border border-derma-border'
                                    : 'text-gray-400 hover:text-derma-black'
                                }`}
                        >
                            {filter === 'ALL' ? 'Tous' :
                                filter === 'PENDING' ? 'En Attente' :
                                    filter === 'APPROVED' ? 'Approuvés' : 'Refusés'}
                        </button>
                    ))}
                </div>

                <div className="relative w-full lg:w-96">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Rechercher par institut, email ou contact..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAF8] border border-derma-border rounded text-sm focus:outline-none focus:border-derma-gold transition-colors font-light"
                    />
                </div>
            </div>

            {/* Partners Table */}
            <div className="bg-white border border-derma-border rounded-lg shadow-premium overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#FAFAF8] border-b border-derma-border">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Socio / Institut</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Contact & Email</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Statut</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Inscription</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-derma-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-light italic">Chargement des partenaires...</td>
                                </tr>
                            ) : filteredPartners.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-light italic">Aucun partenaire trouvé.</td>
                                </tr>
                            ) : (
                                filteredPartners.map((partner) => (
                                    <tr key={partner.id} className="hover:bg-[#FAFAF8]/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-derma-cream flex items-center justify-center text-derma-gold border border-derma-gold/10">
                                                    <Building2 size={16} />
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-bold text-derma-black leading-tight mb-0.5">{partner.instituteName}</div>
                                                    <div className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{partner.id.split('-')[0]}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[12px] text-derma-black font-medium">{partner.contactName}</span>
                                                <span className="text-[11px] text-gray-400 font-light">{partner.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={partner.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-[11px] text-gray-400 font-light">
                                                <Calendar size={12} className="opacity-40" />
                                                {partner.joinDate}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {partner.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(partner.id, 'approved')}
                                                            title="Approuver"
                                                            className="p-1.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(partner.id, 'rejected')}
                                                            title="Refuser"
                                                            className="p-1.5 bg-rose-50 text-rose-600 rounded border border-rose-200 hover:bg-rose-600 hover:text-white transition-all"
                                                        >
                                                            <XCircle size={14} />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => setSelectedPartner(partner)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-derma-border rounded text-[10px] font-bold uppercase tracking-widest text-derma-black hover:border-derma-gold hover:text-derma-gold transition-all"
                                                >
                                                    <Eye size={12} /> Détails
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Info */}
                <div className="px-6 py-4 bg-[#FAFAF8] border-t border-derma-border flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>{filteredPartners.length} Socio(s) Affiché(s)</span>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> Sécurisé par Supabase</span>
                    </div>
                </div>
            </div>

            {/* Detail Overlay / Partial Modal Placeholder */}
            {selectedPartner && (
                <div className="fixed inset-0 z-[100] flex items-center justify-end">
                    <div className="absolute inset-0 bg-derma-black/40 backdrop-blur-sm" onClick={() => setSelectedPartner(null)}></div>
                    <div className="relative w-full max-w-xl h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
                        <div className="p-8">
                            <button onClick={() => setSelectedPartner(null)} className="mb-8 p-2 hover:bg-gray-100 rounded-full transition-all">
                                <X size={20} />
                            </button>

                            <div className="space-y-8">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-oswald text-4xl text-derma-black uppercase leading-none mb-2">{selectedPartner.instituteName}</h3>
                                        <div className="flex items-center gap-4">
                                            <StatusBadge status={selectedPartner.status} />
                                            <span className="text-gray-300 font-mono text-xs">{selectedPartner.id}</span>
                                        </div>
                                    </div>
                                    <div className="w-16 h-16 rounded bg-derma-cream border border-derma-gold/10 flex items-center justify-center text-derma-gold">
                                        <Building2 size={32} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-[#FAFAF8] border border-derma-border rounded">
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Contact Principal</span>
                                        <div className="text-derma-black font-bold flex items-center gap-2">
                                            <User size={14} className="text-derma-gold" /> {selectedPartner.contactName}
                                        </div>
                                    </div>
                                    <div className="p-5 bg-[#FAFAF8] border border-derma-border rounded">
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Email Affaire</span>
                                        <div className="text-derma-black font-bold flex items-center gap-2">
                                            <Mail size={14} className="text-derma-gold" /> {selectedPartner.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border border-derma-border rounded-lg space-y-6">
                                    <h4 className="font-oswald text-sm uppercase tracking-widest border-b border-derma-border pb-3">Informations de Profil</h4>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 font-light flex items-center gap-2"><MapPin size={14} /> Localisation</span>
                                            <span className="font-bold text-derma-black">{selectedPartner.location}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 font-light flex items-center gap-2"><Clock size={14} /> Date d'entrée</span>
                                            <span className="font-bold text-derma-black">{selectedPartner.joinDate}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 font-light flex items-center gap-2"><Filter size={14} /> Niveau Tier</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-widest ${selectedPartner.tier === UserTier.PREMIUM ? 'bg-derma-gold/10 border-derma-gold/20 text-derma-gold' : 'bg-gray-100 border-gray-200 text-gray-500'
                                                }`}>
                                                {selectedPartner.tier}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {selectedPartner.status === 'PENDING' && (
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => handleUpdateStatus(selectedPartner.id, 'approved')}
                                            className="flex-1 bg-emerald-600 text-white py-4 rounded font-bold text-[11px] uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check size={16} /> Approuver l'accès
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedPartner.id, 'rejected')}
                                            className="flex-1 bg-white border border-rose-200 text-rose-600 py-4 rounded font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={16} /> Refuser
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPartners;