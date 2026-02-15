import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    FileText,
    PlayCircle,
    Award,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    ExternalLink,
    ChevronRight,
    Filter,
    CheckCircle2,
    XCircle,
    Video,
    BookOpen,
    Download,
    Clock
} from 'lucide-react';
import { AcademyResource, UserTier } from '../types';
import { supabase } from '../utils/supabase';
import { useLanguage } from '../context/LanguageContext';

const AdminAcademy: React.FC = () => {
    const { t } = useLanguage();
    const [resources, setResources] = useState<AcademyResource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'VIDEO' | 'PDF' | 'COURSE' | 'MASTERCLASS'>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Partial<AcademyResource> | null>(null);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('academy_content')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;

            const mappedData: AcademyResource[] = (data || []).map(r => ({
                id: r.id,
                title: r.title,
                description: r.description,
                type: r.type,
                category: r.category,
                tierReq: r.tier_requirement === 'MULTIPLE' ? 'SPECIFIC' : r.tier_requirement,
                academyLevel: r.academy_level || 'STANDARD',
                strategicLabel: r.strategic_label,
                volumeImpact: r.volume_impact,
                requiredVolume: r.required_volume,
                thumbnail: r.thumbnail || 'https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?auto=format&fit=crop&q=80&w=400',
                contentUrl: r.content_url,
                duration: r.duration,
                orderIndex: r.order_index,
                status: r.status,
                allowedTiers: r.allowed_tiers || [],
                visibilityMode: r.visibility_mode || 'LOCKED'
            }));

            setResources(mappedData);
        } catch (error) {
            console.error('Error fetching academy content:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getTierLabel = (tier: UserTier | 'SPECIFIC' | 'MULTIPLE') => {
        switch (tier) {
            case UserTier.STANDARD: return t('academy_form_tier_std');
            case UserTier.PREMIUM_BASE: return t('academy_form_tier_prem');
            case 'SPECIFIC': return t('academy_form_tier_spec');
            case 'MULTIPLE': return 'Accès Multi-Niveaux';
            default: return tier;
        }
    };

    const getResourceTypeName = (type: string) => {
        switch (type) {
            case 'VIDEO': return t('academy_resource_video');
            case 'PDF': return t('academy_resource_pdf');
            case 'COURSE': return t('academy_resource_course');
            case 'MASTERCLASS': return t('academy_resource_masterclass');
            case 'WEBINAR': return t('academy_resource_webinar');
            case 'DOWNLOADABLE': return t('academy_resource_download');
            default: return type;
        }
    };

    const handleSaveResource = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingResource) return;

        try {
            const payload = {
                title: editingResource.title,
                description: editingResource.description,
                type: editingResource.type,
                category: editingResource.category,
                tier_requirement: (editingResource.tierReq === 'MULTIPLE' || (editingResource.allowedTiers && editingResource.allowedTiers.length > 1)) ? 'SPECIFIC' : editingResource.tierReq,
                academy_level: editingResource.academyLevel || 'STANDARD',
                strategic_label: editingResource.strategicLabel,
                volume_impact: editingResource.volumeImpact,
                required_volume: editingResource.requiredVolume || 0,
                thumbnail: editingResource.thumbnail,
                content_url: editingResource.contentUrl,
                duration: editingResource.duration,
                order_index: editingResource.orderIndex || 0,
                status: editingResource.status || 'DRAFT',
                allowed_tiers: editingResource.allowedTiers || [],
                visibility_mode: editingResource.visibilityMode || 'LOCKED'
            };

            if (editingResource.id) {
                const { error } = await supabase
                    .from('academy_content')
                    .update(payload)
                    .eq('id', editingResource.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('academy_content')
                    .insert([payload]);
                if (error) throw error;
            }

            setIsModalOpen(false);
            setEditingResource(null);
            await fetchResources();
        } catch (error: any) {
            console.error('Error saving resource:', error);
            const errorMsg = error.message || error.details || JSON.stringify(error);
            alert(`${t('academy_admin_save_error')}\n\nDetalles: ${errorMsg}`);
        }
    };

    const handleDeleteResource = async (id: string) => {
        if (!confirm(t('academy_admin_delete_confirm'))) return;
        try {
            const { error } = await supabase
                .from('academy_content')
                .delete()
                .eq('id', id);
            if (error) throw error;
            await fetchResources();
        } catch (error) {
            console.error('Error deleting resource:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'VIDEO': return <Video size={18} />;
            case 'WEBINAR': return <PlayCircle size={18} />;
            case 'PDF': return <FileText size={18} />;
            case 'DOWNLOADABLE': return <Download size={18} />;
            case 'COURSE': return <BookOpen size={18} />;
            case 'MASTERCLASS': return <Award size={18} />;
            default: return <FileText size={18} />;
        }
    };

    const filteredResources = resources.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'ALL' || r.type === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="font-oswald text-2xl text-derma-black uppercase tracking-tight">{t('academy_admin_title')}</h2>
                    <p className="text-gray-400 text-xs font-light tracking-wide">{t('academy_admin_subtitle')}</p>
                </div>
                <button
                    onClick={() => {
                        setEditingResource({
                            type: 'VIDEO',
                            tierReq: 'SPECIFIC',
                            status: 'DRAFT',
                            category: 'General',
                            allowedTiers: [UserTier.STANDARD],
                            visibilityMode: 'LOCKED'
                        });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-derma-black text-white rounded text-[11px] font-bold uppercase tracking-widest hover:bg-derma-gold transition-all shadow-lg"
                >
                    <Plus size={16} /> {t('academy_admin_create')}
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 border border-derma-border rounded-lg shadow-sm">
                <div className="flex gap-1 bg-gray-50 p-1 rounded-md border border-derma-border">
                    {(['ALL', 'VIDEO', 'PDF', 'COURSE', 'MASTERCLASS'] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === filter
                                ? 'bg-white text-derma-black shadow-sm border border-derma-border'
                                : 'text-gray-400 hover:text-derma-black'
                                }`}
                        >
                            {filter === 'ALL' ? t('catalog_tab_all') : getResourceTypeName(filter)}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-80">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                        type="text"
                        placeholder={t('academy_admin_search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-derma-border rounded text-sm focus:outline-none focus:border-derma-gold"
                    />
                </div>
            </div>

            {/* Grid de Contenido */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center text-gray-400 italic">{t('academy_admin_loading')}</div>
                ) : filteredResources.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-400 italic">{t('academy_admin_empty')}</div>
                ) : (
                    filteredResources.map((resource) => (
                        <div key={resource.id} className="bg-white border border-derma-border rounded-lg overflow-hidden group hover:border-derma-gold transition-all shadow-sm hover:shadow-md">
                            <div className="relative h-48 bg-gray-100">
                                <img
                                    src={resource.thumbnail}
                                    alt={resource.title}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                />
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider text-derma-black flex items-center gap-1 shadow-sm">
                                        {getIcon(resource.type)} {getResourceTypeName(resource.type)}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm ${resource.status === 'PUBLISHED' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                                        }`}>
                                        {resource.status === 'PUBLISHED' ? t('common_active') : t('common_draft')}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm ${resource.tierReq === UserTier.STANDARD ? 'bg-gray-100 text-gray-500' : 'bg-derma-gold text-white'
                                        }`}>
                                        {getTierLabel(resource.tierReq)}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-derma-gold uppercase tracking-widest">{resource.category}</span>
                                    <span className="text-[10px] text-gray-400 font-mono">#{resource.orderIndex}</span>
                                </div>
                                <h3 className="font-oswald text-lg text-derma-black uppercase leading-tight mb-2 group-hover:text-derma-gold transition-colors">{resource.title}</h3>
                                <p className="text-gray-400 text-xs font-light line-clamp-2 mb-4 h-8">{resource.description || t('common_no_description')}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                                        <Clock size={12} /> {resource.duration || 'N/A'}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                setEditingResource(resource);
                                                setIsModalOpen(true);
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded-md text-gray-400 hover:text-derma-blue transition-all" title={t('common_edit')}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => resource.id && handleDeleteResource(resource.id)}
                                            className="p-2 hover:bg-rose-50 rounded-md text-gray-400 hover:text-rose-500 transition-all" title={t('common_delete')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-derma-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-derma-border bg-gray-50 flex justify-between items-center">
                            <h3 className="font-oswald text-xl text-derma-black uppercase tracking-tight">
                                {editingResource?.id ? t('academy_form_update') : t('academy_form_new')}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-derma-black"><XCircle size={24} /></button>
                        </div>

                        <form onSubmit={handleSaveResource} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('academy_form_title')}</label>
                                    <input
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-derma-border rounded text-sm focus:border-derma-gold outline-none"
                                        value={editingResource?.title || ''}
                                        onChange={e => setEditingResource({ ...editingResource!, title: e.target.value })}
                                        placeholder={t('academy_form_title_placeholder')}
                                    />
                                </div>

                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('academy_form_desc')}</label>
                                    <textarea
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-derma-border rounded text-sm focus:border-derma-gold outline-none h-20"
                                        value={editingResource?.description || ''}
                                        onChange={e => setEditingResource({ ...editingResource!, description: e.target.value })}
                                        placeholder={t('academy_form_desc_placeholder')}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('academy_form_type')}</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-derma-border rounded text-sm focus:border-derma-gold outline-none"
                                        value={editingResource?.type || 'VIDEO'}
                                        onChange={e => setEditingResource({ ...editingResource!, type: e.target.value as any })}
                                    >
                                        <option value="VIDEO">{t('academy_resource_video')}</option>
                                        <option value="MASTERCLASS">{t('academy_resource_masterclass')}</option>
                                        <option value="COURSE">{t('academy_resource_course')}</option>
                                        <option value="PDF">{t('academy_resource_pdf')}</option>
                                        <option value="DOWNLOADABLE">{t('academy_resource_download')}</option>
                                        <option value="WEBINAR">{t('academy_resource_webinar')}</option>
                                        <option value="CERTIFICATION">Certification</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('academy_form_cat')}</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-derma-border rounded text-sm focus:border-derma-gold outline-none"
                                        value={editingResource?.category || ''}
                                        onChange={e => setEditingResource({ ...editingResource!, category: e.target.value })}
                                        placeholder={t('academy_form_cat_placeholder')}
                                    />
                                </div>

                                <div className="col-span-2 p-4 bg-gray-50 border border-derma-border rounded-lg space-y-4">
                                    <label className="text-[11px] font-bold text-derma-black uppercase tracking-widest flex items-center gap-2">
                                        👥 Accès & Visibilité
                                    </label>

                                    <div className="space-y-3">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Visible para:</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: UserTier.STANDARD, label: 'Standard' },
                                                { id: UserTier.PREMIUM_BASE, label: 'Premium Base' },
                                                { id: UserTier.PREMIUM_PRO, label: 'Premium Pro' },
                                                { id: UserTier.PREMIUM_ELITE, label: 'Premium Elite' }
                                            ].map(tier => (
                                                <label key={tier.id} className="flex items-center gap-2 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-derma-border text-derma-gold focus:ring-derma-gold"
                                                        checked={editingResource?.allowedTiers?.includes(tier.id)}
                                                        onChange={e => {
                                                            const current = editingResource?.allowedTiers || [];
                                                            const next = e.target.checked
                                                                ? [...current, tier.id]
                                                                : current.filter(t => t !== tier.id);
                                                            setEditingResource({ ...editingResource!, allowedTiers: next });
                                                        }}
                                                    />
                                                    <span className="text-xs text-derma-black group-hover:text-derma-gold transition-colors">{tier.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-derma-border space-y-3">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                            🔒 Si no tiene acceso:
                                        </p>
                                        <div className="space-y-2">
                                            {[
                                                { id: 'HIDE', label: 'Ocultar completamente' },
                                                { id: 'LOCKED', label: 'Mostrar bloqueado con mensaje' },
                                                { id: 'PREVIEW', label: 'Mostrar preview de 30 segundos' }
                                            ].map(mode => (
                                                <label key={mode.id} className="flex items-center gap-2 cursor-pointer group">
                                                    <input
                                                        type="radio"
                                                        name="visibilityMode"
                                                        className="w-4 h-4 border-derma-border text-derma-gold focus:ring-derma-gold"
                                                        checked={editingResource?.visibilityMode === mode.id}
                                                        onChange={() => setEditingResource({ ...editingResource!, visibilityMode: mode.id as any })}
                                                    />
                                                    <span className="text-xs text-derma-black group-hover:text-derma-gold transition-colors">{mode.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nivel Academy 2.0</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-derma-border rounded text-sm focus:border-derma-gold outline-none"
                                        value={editingResource?.academyLevel || 'STANDARD'}
                                        onChange={e => setEditingResource({ ...editingResource!, academyLevel: e.target.value as any })}
                                    >
                                        <option value="STANDARD">Standard</option>
                                        <option value="PREMIUM_BASE">Premium Base</option>
                                        <option value="PREMIUM_PRO">Premium Pro</option>
                                        <option value="PREMIUM_ELITE">Premium Elite</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('academy_form_status')}</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-derma-border rounded text-sm focus:border-derma-gold outline-none"
                                        value={editingResource?.status || 'DRAFT'}
                                        onChange={e => setEditingResource({ ...editingResource!, status: e.target.value as any })}
                                    >
                                        <option value="DRAFT">{t('common_draft')}</option>
                                        <option value="PUBLISHED">{t('common_active')}</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Etiqueta Estratégica</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-derma-border rounded text-sm focus:border-derma-gold outline-none"
                                        value={editingResource?.strategicLabel || ''}
                                        onChange={e => setEditingResource({ ...editingResource!, strategicLabel: e.target.value })}
                                        placeholder="Ej: Recomendado para subir a Pro"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Impacto en Volumen</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-derma-border rounded text-sm focus:border-derma-gold outline-none"
                                        value={editingResource?.volumeImpact || ''}
                                        onChange={e => setEditingResource({ ...editingResource!, volumeImpact: e.target.value })}
                                        placeholder="Ej: Aumenta ticket promedio 27%"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Volumen Requerido (CHF)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-derma-border rounded text-sm focus:border-derma-gold outline-none"
                                        value={editingResource?.requiredVolume || 0}
                                        onChange={e => setEditingResource({ ...editingResource!, requiredVolume: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('academy_form_thumb')}</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-derma-border rounded text-sm focus:border-derma-gold outline-none"
                                        value={editingResource?.thumbnail || ''}
                                        onChange={e => setEditingResource({ ...editingResource!, thumbnail: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {editingResource?.type === 'PDF' ? t('academy_form_url_pdf') :
                                            editingResource?.type === 'VIDEO' ? t('academy_form_url_video') :
                                                t('academy_form_url_general')}
                                    </label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-derma-border rounded text-sm focus:border-derma-gold outline-none"
                                        value={editingResource?.contentUrl || ''}
                                        onChange={e => setEditingResource({ ...editingResource!, contentUrl: e.target.value })}
                                        placeholder={
                                            editingResource?.type === 'PDF' ? t('academy_form_url_pdf_placeholder') :
                                                editingResource?.type === 'VIDEO' ? t('academy_form_url_video_placeholder') :
                                                    t('academy_form_url_general_placeholder')
                                        }
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('academy_form_duration')}</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-derma-border rounded text-sm focus:border-derma-gold outline-none"
                                        value={editingResource?.duration || ''}
                                        onChange={e => setEditingResource({ ...editingResource!, duration: e.target.value })}
                                        placeholder={t('academy_form_duration_placeholder')}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('academy_form_order')}</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-derma-border rounded text-sm focus:border-derma-gold outline-none"
                                        value={editingResource?.orderIndex || 0}
                                        onChange={e => setEditingResource({ ...editingResource!, orderIndex: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-derma-black text-white font-bold text-[11px] uppercase tracking-[0.2em] rounded shadow-xl hover:bg-derma-gold transition-all"
                                >
                                    {editingResource?.id ? t('academy_form_update') : t('academy_form_submit')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAcademy;
