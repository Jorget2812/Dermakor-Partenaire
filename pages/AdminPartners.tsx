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
    CreditCard,
    ShoppingBag,
    ExternalLink,
    Save,
    Check,
    BarChart2
} from 'lucide-react';
import { UserTier, Partner, AdminPage } from '../types';

const MOCK_PARTNERS_DATA: Partner[] = [
    { id: 'CH-001P', instituteName: 'Institut Belle Étoile', contactName: 'Marie Dupont', email: 'contact@belle.ch', location: 'Lausanne • VD', tier: UserTier.PREMIUM, joinDate: 'Jan 2025', status: 'ACTIVE', monthlySpend: 1240 },
    { id: 'CH-002', instituteName: 'Clinique Leman', contactName: 'Dr. Jean Valjean', email: 'info@leman.ch', location: 'Genève • GE', tier: UserTier.STANDARD, joinDate: 'Dec 2024', status: 'ACTIVE', monthlySpend: 420 },
    { id: 'CH-003P', instituteName: 'Beauty Lab Genève', contactName: 'Sophie Marceau', email: 'hello@beautylab.ch', location: 'Genève • GE', tier: UserTier.PREMIUM, joinDate: 'Nov 2024', status: 'ACTIVE', monthlySpend: 890 },
    { id: 'CH-004', instituteName: 'Esthétique 3000', contactName: 'Pierre Curie', email: 'contact@e3000.ch', location: 'Fribourg • FR', tier: UserTier.STANDARD, joinDate: 'Oct 2024', status: 'PENDING', monthlySpend: 0 },
];

interface AdminPartnersProps {
    onNavigate: (page: AdminPage) => void;
}

const AdminPartners: React.FC<AdminPartnersProps> = ({ onNavigate }) => {
    // State for list and selection
    const [partners, setPartners] = useState<Partner[]>(MOCK_PARTNERS_DATA);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

    // State for editing
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Partner>>({});

    // Reset states when modal closes
    useEffect(() => {
        if (!selectedPartner) {
            setIsEditing(false);
            setEditForm({});
        }
    }, [selectedPartner]);

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            ACTIVE: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
            PENDING: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
            INACTIVE: 'bg-[#999999]/10 text-[#999999] border-[#999999]/20',
        }[status] || '';

        return (
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${styles}`}>
                {status}
            </span>
        );
    };

    const TierBadge = ({ tier }: { tier: UserTier }) => (
        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold border
      ${tier === UserTier.PREMIUM
                ? 'bg-[#C0A76A]/10 text-[#C0A76A] border-[#C0A76A]/30'
                : 'bg-[#2C3E50]/10 text-[#2C3E50] border-[#2C3E50]/20'
            }`}>
            {tier === UserTier.PREMIUM && '⭐'} {tier}
        </div>
    );

    // --- HANDLERS ---
    const handleSelectPartner = (partner: Partner) => {
        setSelectedPartner(partner);
    };

    const handleStartEdit = () => {
        if (selectedPartner) {
            setEditForm({ ...selectedPartner });
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm({});
    };

    const handleSaveEdit = () => {
        if (!selectedPartner) return;

        // Merge updates
        const updatedPartner = { ...selectedPartner, ...editForm } as Partner;

        // Update List
        const updatedList = partners.map(p => p.id === updatedPartner.id ? updatedPartner : p);
        setPartners(updatedList);

        // Update Active View
        setSelectedPartner(updatedPartner);
        setIsEditing(false);
    };

    const handleGoToReports = () => {
        onNavigate('reports');
    };

    return (
        <div className="space-y-6">

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-2">
                    <button className="bg-[#1A1A1A] text-white px-4 py-2 rounded text-[13px] font-semibold flex items-center gap-2 hover:bg-[#2C3E50] transition-colors">
                        <Plus size={16} /> Nouveau
                    </button>
                    <button className="bg-white border border-[#E0E0E0] text-[#1A1A1A] px-4 py-2 rounded text-[13px] font-medium flex items-center gap-2 hover:bg-[#FAFAF8]">
                        <Download size={16} /> Exporter
                    </button>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="pl-9 pr-4 py-2 bg-white border border-[#E0E0E0] rounded text-sm w-64 focus:outline-none focus:border-[#1A1A1A]"
                        />
                    </div>
                    <button className="bg-white border border-[#E0E0E0] p-2 rounded hover:bg-[#FAFAF8]">
                        <Filter size={18} className="text-[#6B6B6B]" />
                    </button>
                </div>
            </div>

            {/* Stats Summary Strip */}
            <div className="flex gap-8 border-b border-[#E0E0E0] pb-1">
                <button className="text-[13px] font-medium text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-3 px-1">Actifs ({partners.filter(p => p.status === 'ACTIVE').length})</button>
                <button className="text-[13px] font-medium text-[#999999] hover:text-[#6B6B6B] pb-3 px-1 transition-colors">En attente ({partners.filter(p => p.status === 'PENDING').length})</button>
                <button className="text-[13px] font-medium text-[#999999] hover:text-[#6B6B6B] pb-3 px-1 transition-colors">Inactifs (0)</button>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#E8E8E8] rounded-lg overflow-hidden">
                <div className="grid grid-cols-[100px_2fr_1.5fr_120px_100px_60px] bg-[#FAFAF8] border-b border-[#E8E8E8] px-6 py-3 text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-wider">
                    <div>ID</div>
                    <div>Institut / Contact</div>
                    <div>Localisation / Email</div>
                    <div>Tier</div>
                    <div>Inscrit</div>
                    <div className="text-right">Action</div>
                </div>

                <div className="divide-y divide-[#F5F5F5]">
                    {partners.map((partner) => (
                        <div
                            key={partner.id}
                            onClick={() => handleSelectPartner(partner)}
                            className="grid grid-cols-[100px_2fr_1.5fr_120px_100px_60px] px-6 py-4 items-center hover:bg-[#FAFAF8] transition-colors cursor-pointer group"
                        >
                            <div>
                                <span className="font-mono text-[12px] font-medium text-[#2C3E50] bg-[#F5F5F5] px-2 py-1 rounded">
                                    {partner.id}
                                </span>
                            </div>
                            <div>
                                <div className="text-[14px] font-medium text-[#1A1A1A] mb-0.5">{partner.instituteName}</div>
                                <div className="text-[12px] text-[#6B6B6B] flex items-center gap-1"><User size={10} /> {partner.contactName}</div>
                            </div>
                            <div>
                                <div className="text-[14px] text-[#1A1A1A] mb-0.5">{partner.location}</div>
                                <div className="text-[12px] text-[#6B6B6B] flex items-center gap-1"><Mail size={10} /> {partner.email}</div>
                            </div>
                            <div>
                                <TierBadge tier={partner.tier} />
                            </div>
                            <div className="text-[13px] text-[#6B6B6B] font-mono">{partner.joinDate}</div>
                            <div className="text-right">
                                <button className="p-1.5 rounded hover:bg-[#E8E8E8] text-gray-400 hover:text-[#1A1A1A]">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="bg-[#FAFAF8] border-t border-[#E8E8E8] px-6 py-3 flex justify-between items-center text-[12px] text-[#6B6B6B]">
                    <span>Affichage {partners.length} résultats</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-[#E0E0E0] rounded bg-white hover:bg-[#F5F5F5] disabled:opacity-50">Préc.</button>
                        <button className="px-3 py-1 border border-[#E0E0E0] rounded bg-white hover:bg-[#F5F5F5]">Suiv.</button>
                    </div>
                </div>
            </div>

            {/* PARTNER DETAIL MODAL */}
            {selectedPartner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm" onClick={() => setSelectedPartner(null)}></div>
                    <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl relative z-10 overflow-hidden animate-slide-up">

                        {/* Modal Header */}
                        <div className="bg-[#FAFAF8] px-8 py-6 border-b border-[#E8E8E8] flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.instituteName || ''}
                                            onChange={(e) => setEditForm({ ...editForm, instituteName: e.target.value })}
                                            className="font-oswald text-2xl text-[#1A1A1A] border border-[#E0E0E0] rounded px-2 py-1 w-full bg-white focus:outline-none focus:border-[#C0A76A]"
                                        />
                                    ) : (
                                        <h2 className="font-oswald text-2xl text-[#1A1A1A]">{selectedPartner.instituteName}</h2>
                                    )}
                                    <StatusBadge status={selectedPartner.status} />
                                </div>
                                <p className="font-mono text-sm text-[#6B6B6B]">{selectedPartner.id}</p>
                            </div>
                            <button onClick={() => setSelectedPartner(null)} className="text-gray-400 hover:text-[#1A1A1A]">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8">

                            {/* Key Stats Row */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 border border-[#E8E8E8] rounded bg-white">
                                    <span className="text-[11px] uppercase tracking-wider text-[#6B6B6B] block mb-1">Niveau Actuel</span>
                                    {isEditing ? (
                                        <select
                                            value={editForm.tier || UserTier.STANDARD}
                                            onChange={(e) => setEditForm({ ...editForm, tier: e.target.value as UserTier })}
                                            className="w-full mt-1 border border-[#E0E0E0] rounded p-1 text-sm bg-white"
                                        >
                                            <option value={UserTier.STANDARD}>Standard</option>
                                            <option value={UserTier.PREMIUM}>Premium</option>
                                        </select>
                                    ) : (
                                        <TierBadge tier={selectedPartner.tier} />
                                    )}
                                    <p className="text-[11px] text-[#999] mt-2">Depuis Janvier 2025</p>
                                </div>
                                <div className="p-4 border border-[#E8E8E8] rounded bg-white">
                                    <span className="text-[11px] uppercase tracking-wider text-[#6B6B6B] block mb-1">Volume Mensuel</span>
                                    <div className="font-oswald text-xl text-[#1A1A1A]">CHF {selectedPartner.monthlySpend}</div>
                                    <p className="text-[11px] text-[#10B981] mt-1">
                                        {selectedPartner.monthlySpend > 800 ? '✓ Objectif Premium atteint' : '⚠️ En dessous de l\'objectif'}
                                    </p>
                                </div>
                            </div>

                            {/* Information Grid */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h4 className="font-oswald text-sm text-[#1A1A1A] uppercase tracking-wide mb-4 border-b border-[#F5F5F5] pb-2">Contact</h4>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-center gap-3 h-8">
                                            <User size={16} className="text-[#C0A76A]" />
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.contactName || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                                                    className="border border-[#E0E0E0] rounded px-2 py-1 w-full text-sm focus:outline-none focus:border-[#1A1A1A]"
                                                />
                                            ) : (
                                                <span className="text-[#1A1A1A]">{selectedPartner.contactName}</span>
                                            )}
                                        </li>
                                        <li className="flex items-center gap-3 h-8">
                                            <Mail size={16} className="text-[#C0A76A]" />
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.email || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                    className="border border-[#E0E0E0] rounded px-2 py-1 w-full text-sm focus:outline-none focus:border-[#1A1A1A]"
                                                />
                                            ) : (
                                                <span className="text-[#1A1A1A]">{selectedPartner.email}</span>
                                            )}
                                        </li>
                                        <li className="flex items-center gap-3 h-8">
                                            <MapPin size={16} className="text-[#C0A76A]" />
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.location || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                                    className="border border-[#E0E0E0] rounded px-2 py-1 w-full text-sm focus:outline-none focus:border-[#1A1A1A]"
                                                />
                                            ) : (
                                                <span className="text-[#1A1A1A]">{selectedPartner.location}</span>
                                            )}
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-oswald text-sm text-[#1A1A1A] uppercase tracking-wide mb-4 border-b border-[#F5F5F5] pb-2">Activité</h4>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex gap-3 h-8 items-center">
                                            <Calendar size={16} className="text-gray-400" />
                                            <span className="text-[#6B6B6B]">Inscrit le: <span className="text-[#1A1A1A] font-medium">15 Jan 2025</span></span>
                                        </li>
                                        <li className="flex gap-3 h-8 items-center">
                                            <ShoppingBag size={16} className="text-gray-400" />
                                            <span className="text-[#6B6B6B]">Dernière commande: <span className="text-[#1A1A1A] font-medium">Il y a 2 jours</span></span>
                                        </li>
                                        <li className="flex gap-3 h-8 items-center">
                                            <CreditCard size={16} className="text-gray-400" />
                                            <span className="text-[#6B6B6B]">Total à vie: <span className="text-[#1A1A1A] font-medium">CHF 4,520</span></span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {!isEditing && (
                                <div className="bg-[#FAFAF8] p-4 rounded border border-[#E8E8E8]">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-oswald text-sm text-[#1A1A1A] uppercase tracking-wide">Dernières Commandes</h4>
                                        <button className="text-[11px] font-medium text-[#C0A76A] hover:underline">Voir tout</button>
                                    </div>
                                    <div className="space-y-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex justify-between items-center bg-white p-2 rounded border border-[#F5F5F5] text-sm">
                                                <span className="font-mono text-[#6B6B6B]">#125{i}</span>
                                                <span className="text-[#1A1A1A] font-medium">CHF 1,240</span>
                                                <div className="flex items-center gap-1 text-[11px] text-[#6B6B6B]">
                                                    <Calendar size={10} /> 14.02.2025
                                                </div>
                                                <ExternalLink size={12} className="text-gray-400 cursor-pointer hover:text-[#1A1A1A]" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer Actions */}
                        <div className="bg-[#FAFAF8] px-8 py-4 border-t border-[#E8E8E8] flex justify-between items-center">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="text-gray-500 text-sm font-medium hover:text-[#1A1A1A]"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="px-6 py-2 bg-[#10B981] text-white rounded text-sm font-medium hover:bg-[#059669] flex items-center gap-2 shadow-sm"
                                    >
                                        <Check size={16} /> Enregistrer
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="text-[#EF4444] text-xs font-semibold hover:underline">Bloquer le partenaire</button>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleStartEdit}
                                            className="px-4 py-2 border border-[#E0E0E0] rounded bg-white text-sm font-medium hover:bg-[#F5F5F5] hover:border-[#1A1A1A] transition-colors"
                                        >
                                            Éditer
                                        </button>
                                        <button
                                            onClick={handleGoToReports}
                                            className="px-4 py-2 bg-[#1A1A1A] text-white rounded text-sm font-medium hover:bg-[#2C3E50] flex items-center gap-2 shadow-sm"
                                        >
                                            <BarChart2 size={16} /> Voir Analytics complet
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPartners;