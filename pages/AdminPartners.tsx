import React, { useState, useEffect } from 'react';
import {
    Search,
    MoreHorizontal,
    Filter,
    Download,
    Plus,
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
    Clock,
    Star,
    Loader2,
    User as UserIcon,
    RefreshCcw,
    Bookmark,
    ShieldAlert,
    Unlock,
    Lock as LockIcon
} from 'lucide-react';
import { UserTier, Partner, Language, AdminPage } from '../types';
import { supabase } from '../utils/supabase';
import { useLanguage } from '../context/LanguageContext';

interface AdminPartnersProps {
    onNavigate: (page: AdminPage) => void;
}

const AdminPartners: React.FC<AdminPartnersProps> = ({ onNavigate }) => {
    const { t, language } = useLanguage();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
    const [view, setView] = useState<'PARTNERS' | 'PROSPECTS'>('PARTNERS');
    const [prospects, setProspects] = useState<any[]>([]);
    const [isAddingPartner, setIsAddingPartner] = useState(false);
    const [newPartner, setNewPartner] = useState({
        company_name: '',
        contact_name: '',
        email: '',
        address: '',
        tier: UserTier.STANDARD
    });

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

    const fetchProspects = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('prospects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProspects(data || []);
        } catch (error) {
            console.error('Error fetching prospects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'PARTNERS') {
            fetchPartners();
        } else {
            fetchProspects();
        }
    }, [view]);

    const filteredPartners = partners.filter(p => {
        const matchesSearch = (p.instituteName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.contactName || '').toLowerCase().includes(searchTerm.toLowerCase());

        let matchesFilter = activeFilter === 'ALL' || p.status === activeFilter;
        // Map 'ACTIVE' to 'APPROVED' for filtering if necessary
        if (activeFilter === 'APPROVED' && p.status === 'ACTIVE') matchesFilter = true;

        return matchesSearch && matchesFilter;
    });

    const handleUpdateAcademyAccess = async (partnerId: string, updates: any) => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('partner_users')
                .update({
                    academy_access_status: updates.academy_access_status,
                    academy_access_type: updates.academy_access_type,
                    academy_access_until: updates.academy_access_until || null
                })
                .eq('id', partnerId);

            if (error) throw error;
            alert(t('academy_access_updated'));
            await fetchPartners();

            if (selectedPartner?.id === partnerId) {
                const { data: updatedData } = await supabase
                    .from('partner_users')
                    .select('*')
                    .eq('id', partnerId)
                    .single();

                if (updatedData) {
                    const mapped: Partner = {
                        id: updatedData.id,
                        instituteName: updatedData.company_name || 'Sans nom',
                        contactName: updatedData.contact_name || 'Non spécifié',
                        email: updatedData.email || '',
                        location: updatedData.address || 'Non spécifié',
                        tier: (updatedData.tier as UserTier) || UserTier.STANDARD,
                        joinDate: updatedData.created_at ? new Date(updatedData.created_at).toLocaleDateString('fr-CH') : 'N/A',
                        status: (updatedData.status || 'PENDING').toUpperCase() as any,
                        monthlySpend: 0,
                        academyAccessStatus: updatedData.academy_access_status,
                        academyAccessType: updatedData.academy_access_type,
                        academyAccessUntil: updatedData.academy_access_until
                    };
                    setSelectedPartner(mapped);
                }
            }
        } catch (error) {
            console.error('Error updating academy access:', error);
            alert(t('common_error'));
        } finally {
            setIsLoading(false);
        }
    };

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

    const handleExportCSV = () => {
        const headers = ['ID', 'Institut', 'Contact', 'Email', 'Localisation', 'Niveau', 'Date Inscription', 'Statut'];
        const rows = filteredPartners.map(p => [
            p.id,
            p.instituteName,
            p.contactName,
            p.email,
            p.location,
            p.tier,
            p.joinDate,
            p.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `partenaires_dermakor_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCreatePartner = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Generating a random UUID for the new partner if ID is required and not autogenerated
            const partnerId = crypto.randomUUID();

            const { error } = await supabase
                .from('partner_users')
                .insert([{
                    id: partnerId,
                    company_name: newPartner.company_name,
                    contact_name: newPartner.contact_name,
                    email: newPartner.email,
                    city: newPartner.address, // Mapping city as seen in SQL
                    tier: newPartner.tier,
                    status: 'APPROVED'
                }]);

            if (error) throw error;

            setNewPartner({
                company_name: '',
                contact_name: '',
                email: '',
                address: '',
                tier: UserTier.STANDARD
            });
            setIsAddingPartner(false);
            await fetchPartners();
        } catch (error: any) {
            console.error('Error creating partner:', error);
            alert(`Erreur lors de la création du partenaire: ${error.message || ''}`);
        } finally {
            setIsLoading(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
            REJECTED: 'bg-rose-50 text-rose-600 border-rose-100',
        }[status] || 'bg-gray-50 text-gray-500 border-gray-100';

        const label = status === 'APPROVED' || status === 'ACTIVE' ? t('common_active') :
            status === 'PENDING' ? t('partners_status_pending') :
                status === 'REJECTED' ? t('partners_status_rejected') : status;

        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles}`}>
                {label}
            </span>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 bg-[#FAFAF8] min-h-screen p-2">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="font-oswald text-2xl text-derma-black uppercase tracking-tight">
                        {view === 'PARTNERS' ? t('partners_title') : t('prospects_title')}
                    </h2>
                    <p className="text-gray-400 text-xs font-light tracking-wide">
                        {view === 'PARTNERS' ? t('partners_subtitle') : t('prospects_subtitle')}
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-white border border-derma-border rounded p-1 mr-2">
                        <button
                            onClick={() => setView('PARTNERS')}
                            className={`px-4 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'PARTNERS' ? 'bg-derma-black text-white shadow-sm' : 'text-gray-400 hover:text-derma-black'}`}
                        >
                            {t('admin_nav_partners')}
                        </button>
                        <button
                            onClick={() => setView('PROSPECTS')}
                            className={`px-4 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'PROSPECTS' ? 'bg-derma-black text-white shadow-sm' : 'text-gray-400 hover:text-derma-black'}`}
                        >
                            {t('admin_nav_prospects')}
                        </button>
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-derma-border rounded text-[11px] font-bold uppercase tracking-widest text-derma-black hover:bg-gray-50 transition-all"
                    >
                        <Download size={14} /> {t('common_export')} CSV
                    </button>
                    <button
                        onClick={() => setIsAddingPartner(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-derma-black text-white rounded text-[11px] font-bold uppercase tracking-widest hover:bg-derma-gold transition-all shadow-lg"
                    >
                        <Plus size={14} /> {t('partners_add_new')}
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
                            {filter === 'ALL' ? t('catalog_tab_all') :
                                filter === 'PENDING' ? t('partners_status_pending') :
                                    filter === 'APPROVED' ? t('partners_status_approved') : t('partners_status_rejected')}
                        </button>
                    ))}
                </div>

                <div className="relative w-full lg:w-96">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                        type="text"
                        placeholder={t('partners_search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAF8] border border-derma-border rounded text-sm focus:outline-none focus:border-derma-gold transition-colors font-light"
                    />
                </div>
            </div>

            {/* Partners Table */}
            <div className="bg-white border border-derma-border rounded-lg shadow-premium overflow-hidden">
                <div className="overflow-x-auto">
                    {view === 'PARTNERS' ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#FAFAF8] border-b border-derma-border">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('partners_table_institute')}</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('partners_table_contact')}</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('catalog_table_status')}</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('partners_table_join_date')}</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">{t('partners_table_actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-derma-border">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-light italic">{t('partners_loading')}</td>
                                    </tr>
                                ) : filteredPartners.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-light italic">{t('partners_empty')}</td>
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
                                                                title={t('partners_approve')}
                                                                className="p-1.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(partner.id, 'rejected')}
                                                                title={t('partners_reject')}
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
                                                        <Eye size={12} /> {t('partners_details')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#FAFAF8] border-b border-derma-border">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('partners_table_prospect')}</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('partners_table_contact')}</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('partners_table_source')}</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('partners_lead_date')}</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">{t('partners_table_actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-derma-border">
                                {isLoading ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">{t('partners_loading')}</td></tr>
                                ) : prospects.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">{t('partners_prospect_empty')}</td></tr>
                                ) : (
                                    prospects.map((prospect) => (
                                        <tr key={prospect.id} className="hover:bg-[#FAFAF8]/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                                        <UserIcon size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="text-[13px] font-bold text-derma-black leading-tight mb-0.5">{prospect.company_name}</div>
                                                        <div className="text-[10px] text-gray-400 uppercase tracking-tighter">{prospect.city}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] text-derma-black font-medium">{prospect.contact_name}</span>
                                                    <span className="text-[11px] text-gray-400 font-light">{prospect.email || prospect.contact_email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border border-blue-100 bg-blue-50 text-blue-600 uppercase tracking-widest">
                                                    {prospect.source || 'WEB'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[11px] text-gray-400">
                                                {new Date(prospect.created_at).toLocaleDateString('fr-CH')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setNewPartner({
                                                            company_name: prospect.company_name,
                                                            contact_name: prospect.contact_name,
                                                            email: prospect.email || prospect.contact_email,
                                                            address: prospect.address || prospect.city || '',
                                                            tier: UserTier.STANDARD
                                                        });
                                                        setIsAddingPartner(true);
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-derma-gold text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-derma-black transition-all shadow-md ml-auto"
                                                >
                                                    <Plus size={12} /> {t('partners_convert')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer Info */}
                <div className="px-6 py-4 bg-[#FAFAF8] border-t border-derma-border flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>{filteredPartners.length} {t('partners_title')}</span>
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
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">{t('partners_main_contact')}</span>
                                        <div className="text-derma-black font-bold flex items-center gap-2">
                                            <UserIcon size={14} className="text-derma-gold" /> {selectedPartner.contactName}
                                        </div>
                                    </div>
                                    <div className="p-5 bg-[#FAFAF8] border border-derma-border rounded overflow-hidden">
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">{t('partners_business_email')}</span>
                                        <div className="text-derma-black font-bold flex items-start gap-2 text-[11px] break-all">
                                            <Mail size={14} className="text-derma-gold mt-0.5 shrink-0" /> {selectedPartner.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border border-derma-border rounded-lg space-y-6">
                                    <h4 className="font-oswald text-sm uppercase tracking-widest border-b border-derma-border pb-3">{t('partners_profile_info')}</h4>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 font-light flex items-center gap-2"><MapPin size={14} /> {t('partners_location')}</span>
                                            <span className="font-bold text-derma-black">{selectedPartner.location}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 font-light flex items-center gap-2"><Clock size={14} /> {t('partners_joined')}</span>
                                            <span className="font-bold text-derma-black">{selectedPartner.joinDate}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 font-light flex items-center gap-2"><Filter size={14} /> {t('partners_tier_level')}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-widest ${selectedPartner.tier === UserTier.PREMIUM ? 'bg-derma-gold/10 border-derma-gold/20 text-derma-gold' : 'bg-gray-100 border-gray-200 text-gray-500'
                                                }`}>
                                                {selectedPartner.tier}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* ACADEMY ACCESS SECTION */}
                                <div className="p-6 border border-derma-border rounded-lg bg-gray-50/50 space-y-6">
                                    <div className="flex items-center justify-between border-b border-derma-border pb-3">
                                        <h4 className="font-oswald text-sm uppercase tracking-widest flex items-center gap-2 text-derma-black">
                                            <Bookmark size={14} className="text-derma-gold" /> 🔐 {t('academy_admin_title')}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            {(selectedPartner as any).academy_access_status === 'ACTIVE' ? (
                                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                                    <Unlock size={10} /> {t('academy_access_active')}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[9px] font-black uppercase tracking-widest border border-rose-100">
                                                    <LockIcon size={10} /> {t('academy_access_locked')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleUpdateAcademyAccess(selectedPartner.id, { academy_access_status: 'ACTIVE', academy_access_type: 'PERMANENT' })}
                                            className={`p-4 border rounded flex flex-col items-center gap-2 transition-all ${(selectedPartner as any).academy_access_status === 'ACTIVE' && (selectedPartner as any).academy_access_type === 'PERMANENT' ? 'bg-derma-black text-white border-derma-black shadow-md' : 'bg-white text-gray-400 border-derma-border hover:border-gray-300'}`}
                                        >
                                            <Unlock size={16} />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">{t('academy_access_perm')}</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                const days = t('academy_access_expire'); // Reusing expire key for prompt or similar
                                                const userInput = prompt(days, '30');
                                                if (!userInput) return;
                                                const until = new Date();
                                                until.setDate(until.getDate() + parseInt(userInput));
                                                handleUpdateAcademyAccess(selectedPartner.id, { academy_access_status: 'ACTIVE', academy_access_type: 'TEMPORARY', academy_access_until: until.toISOString() });
                                            }}
                                            className={`p-4 border rounded flex flex-col items-center gap-2 transition-all ${(selectedPartner as any).academy_access_status === 'ACTIVE' && (selectedPartner as any).academy_access_type === 'TEMPORARY' ? 'bg-derma-gold text-white border-derma-gold shadow-md' : 'bg-white text-gray-400 border-derma-border hover:border-gray-300'}`}
                                        >
                                            <ShieldAlert size={16} />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">{t('academy_access_temp')}</span>
                                        </button>
                                        <button
                                            onClick={() => handleUpdateAcademyAccess(selectedPartner.id, { academy_access_status: 'INACTIVE', academy_access_type: 'AUTOMATIC' })}
                                            className="col-span-2 p-3 bg-white border border-rose-100 text-rose-600 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={14} /> {t('academy_access_disable')}
                                        </button>
                                    </div>

                                    {(selectedPartner as any).academy_access_until && (
                                        <div className="p-3 bg-amber-50 border border-amber-100 rounded text-[10px] text-amber-700 flex items-center gap-2">
                                            <Clock size={14} /> {t('academy_access_expire')}: {new Date((selectedPartner as any).academy_access_until).toLocaleDateString(language === Language.FR ? 'fr-CH' : language === Language.DE ? 'de-CH' : 'it-CH')}
                                        </div>
                                    )}
                                </div>

                                {selectedPartner.status === 'PENDING' && (
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => handleUpdateStatus(selectedPartner.id, 'approved')}
                                            className="flex-1 bg-emerald-600 text-white py-4 rounded font-bold text-[11px] uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check size={16} /> {t('partners_approve')}
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedPartner.id, 'rejected')}
                                            className="flex-1 bg-white border border-rose-200 text-rose-600 py-4 rounded font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={16} /> {t('partners_reject')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* New Partner Overlay */}
            {isAddingPartner && (
                <div className="fixed inset-0 z-[110] flex items-center justify-end">
                    <div className="absolute inset-0 bg-derma-black/60 backdrop-blur-md" onClick={() => !isLoading && setIsAddingPartner(false)}></div>
                    <div className="relative w-full max-w-lg h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                        <div className="p-8 border-b border-derma-border flex justify-between items-center bg-[#FAFAF8]">
                            <div>
                                <h3 className="font-oswald text-2xl text-derma-black uppercase tracking-tight">{t('partners_new_title')}</h3>
                                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mt-1">{t('partners_new_subtitle')}</p>
                            </div>
                            <button
                                onClick={() => setIsAddingPartner(false)}
                                className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-derma-border"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePartner} className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('partners_label_institute')}</label>
                                <input
                                    required
                                    type="text"
                                    value={newPartner.company_name}
                                    onChange={(e) => setNewPartner({ ...newPartner, company_name: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-derma-border rounded text-sm focus:outline-none focus:border-derma-gold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('partners_label_contact')}</label>
                                <input
                                    required
                                    type="text"
                                    value={newPartner.contact_name}
                                    onChange={(e) => setNewPartner({ ...newPartner, contact_name: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-derma-border rounded text-sm focus:outline-none focus:border-derma-gold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('partners_business_email')}</label>
                                <input
                                    required
                                    type="email"
                                    value={newPartner.email}
                                    onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                                    placeholder="contact@institut.ch"
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-derma-border rounded text-sm focus:outline-none focus:border-derma-gold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('partners_label_location')}</label>
                                <input
                                    required
                                    type="text"
                                    value={newPartner.address}
                                    onChange={(e) => setNewPartner({ ...newPartner, address: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-derma-border rounded text-sm focus:outline-none focus:border-derma-gold"
                                />
                            </div>

                            <div className="space-y-2 pt-4">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t('partners_label_tier')}</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setNewPartner({ ...newPartner, tier: UserTier.STANDARD })}
                                        className={`py-6 border rounded flex flex-col items-center gap-2 transition-all ${newPartner.tier === UserTier.STANDARD
                                            ? 'border-derma-black bg-derma-black text-white shadow-lg scale-[1.02]'
                                            : 'border-derma-border bg-white text-gray-400 hover:border-gray-300'}`}
                                    >
                                        <span className="text-[10px] font-bold uppercase tracking-widest">STANDARD</span>
                                        <span className="text-[8px] opacity-60">{t('partners_tier_standard_desc')}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewPartner({ ...newPartner, tier: UserTier.PREMIUM })}
                                        className={`py-6 border rounded flex flex-col items-center gap-2 transition-all ${newPartner.tier === UserTier.PREMIUM
                                            ? 'border-derma-gold bg-derma-gold text-white shadow-lg scale-[1.02]'
                                            : 'border-derma-border bg-white text-gray-400 hover:border-gray-300'}`}
                                    >
                                        <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">PREMIUM <Star size={10} fill="currentColor" /></span>
                                        <span className="text-[8px] opacity-60">{t('partners_tier_premium_desc')}</span>
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="p-8 bg-[#FAFAF8] border-t border-derma-border">
                            <button
                                onClick={handleCreatePartner}
                                disabled={isLoading || !newPartner.company_name || !newPartner.email}
                                className="w-full py-4 bg-derma-black text-white font-bold text-[11px] uppercase tracking-[0.2em] rounded shadow-xl hover:bg-derma-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <>
                                        <Plus size={16} /> {t('partners_btn_create')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPartners;