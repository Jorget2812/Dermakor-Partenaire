import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AuthUser } from '../context/AuthContext';
import { UserTier, AcademyResource } from '../types';
import {
    Lock,
    FileText,
    PlayCircle,
    Award,
    ArrowRight,
    BookOpen,
    Download,
    AlertTriangle,
    Clock,
    Play,
    ShieldAlert,
    ChevronRight,
    CheckCircle,
    TrendingUp,
    Star,
    Crown,
    ExternalLink
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import CertificateTemplate from '../components/CertificateTemplate';
import ContentViewer from '../components/ContentViewer';
import { useAuth } from '../hooks/useAuth';

interface AcademyProps {
    user: AuthUser;
}

const Academy: React.FC<AcademyProps> = ({ user }) => {
    const { t } = useLanguage();
    const [resources, setResources] = useState<AcademyResource[]>([]);
    const [overrides, setOverrides] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCertModalOpen, setIsCertModalOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState<AcademyResource | null>(null);
    const [activeCategory, setActiveCategory] = useState<'ALL' | 'VIDEO' | 'PDF' | 'COURSE' | 'MASTERCLASS'>('ALL');

    useEffect(() => {
        fetchAcademyData();
    }, [user.id]);

    const fetchAcademyData = async () => {
        setIsLoading(true);
        try {
            const { data: content, error: contentError } = await supabase
                .from('academy_content')
                .select('*')
                .eq('status', 'PUBLISHED')
                .order('order_index', { ascending: true });

            if (contentError) throw contentError;

            const { data: accessOverrides, error: overrideError } = await supabase
                .from('partner_specific_academy_access')
                .select('content_id')
                .eq('partner_id', user.id);

            if (overrideError) console.warn('Error fetching overrides:', overrideError);

            setResources((content || []).map(r => ({
                id: r.id,
                title: r.title,
                description: r.description,
                type: r.type,
                category: r.category,
                tierReq: r.tier_requirement,
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
            })));

            setOverrides((accessOverrides || []).map(o => o.content_id));
        } catch (error) {
            console.error('Error fetching academy data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkIsLocked = (resource: AcademyResource) => {
        if (user.academyAccessStatus === 'INACTIVE') return true;
        if (overrides.includes(resource.id)) return false;

        // Volume-based automatic unlock (Strategic Priority)
        if (resource.requiredVolume && user.currentSpend >= resource.requiredVolume) {
            return false;
        }

        // granular access control
        if (resource.allowedTiers && resource.allowedTiers.length > 0) {
            return !resource.allowedTiers.includes(user.tier);
        }

        if (resource.tierReq === 'SPECIFIC') return true;

        const tierHierarchy: Record<UserTier, number> = {
            [UserTier.STANDARD]: 1,
            [UserTier.PREMIUM]: 2,
            [UserTier.PREMIUM_BASE]: 2,
            [UserTier.PREMIUM_PRO]: 3,
            [UserTier.PREMIUM_ELITE]: 4
        };

        const userLevel = tierHierarchy[user.tier] || 0;
        const reqLevel = tierHierarchy[resource.tierReq as UserTier] || 0;

        return userLevel < reqLevel;
    };

    const markAsCompleted = async (resourceId: string) => {
        if (!user || user.completedResources.includes(resourceId)) return;

        try {
            const { error } = await supabase
                .from('academy_completions')
                .insert({
                    partner_id: user.id,
                    resource_id: resourceId
                });

            if (error) throw error;

            // In a real scenario, we'd trigger a profile refresh
            // For now, we enhance the local feeling
            window.dispatchEvent(new CustomEvent('academy-resource-completed', { detail: resourceId }));

            // Re-fetch data to sync
            fetchAcademyData();
        } catch (err) {
            console.error('Error marking resource as completed:', err);
        }
    };

    const progressPercent = useMemo(() => {
        if (resources.length === 0) return 0;
        const completedCount = user?.completedResources?.length || 0;
        return Math.min(Math.round((completedCount / resources.length) * 100), 100);
    }, [resources.length, user?.completedResources]);

    const levels = [
        { id: 'STANDARD', label: t('academy_level_std'), icon: <BookOpen size={16} />, tier: UserTier.STANDARD },
        { id: 'PREMIUM_BASE', label: t('academy_level_prem_base'), icon: <Star size={16} />, tier: UserTier.PREMIUM_BASE },
        { id: 'PREMIUM_PRO', label: t('academy_level_prem_pro'), icon: <TrendingUp size={16} />, tier: UserTier.PREMIUM_PRO },
        { id: 'PREMIUM_ELITE', label: t('academy_level_prem_elite'), icon: <Crown size={16} />, tier: UserTier.PREMIUM_ELITE },
    ];

    const categories = [
        { id: 'ALL', label: 'TOUS' },
        { id: 'VIDEO', label: 'VIDÉO PROTOCOLE' },
        { id: 'PDF', label: 'GUIDE PDF' },
        { id: 'COURSE', label: 'COURS COMPLET' },
        { id: 'MASTERCLASS', label: 'MASTERCLASS' },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-derma-gold"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-fade-in bg-white">
            {/* Executive Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-derma-border pb-10">
                <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-[4px] text-derma-gold mb-3 block">Scientific Education Platform</span>
                    <h1 className="font-serif text-5xl text-derma-black leading-tight uppercase tracking-tight mb-3">Dermakor Academy</h1>
                    <p className="text-derma-text-muted text-sm font-light max-w-2xl leading-relaxed">
                        Transformez votre expertise clinique en succès financier. Accédez aux protocoles et stratégies de croissance exclusifs KRX Aesthetics.
                    </p>
                </div>

                {/* Progress Widget */}
                <div className="w-full md:w-64 bg-derma-cream p-5 border border-derma-border rounded-sm shadow-premium">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-derma-text">{t('academy_progress_title')}</span>
                        <span className="text-sm font-serif text-derma-gold">{progressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white border border-derma-border rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            className="h-full bg-derma-gold"
                        />
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[9px] text-derma-text-muted italic">
                        <CheckCircle size={10} className="text-emerald-500" />
                        <span>{t('academy_progress_unlock')}</span>
                    </div>
                </div>
            </div>

            {/* Category Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-derma-border pb-1">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id as any)}
                        className={`relative px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${activeCategory === cat.id
                            ? 'text-derma-gold'
                            : 'text-derma-text-muted hover:text-derma-black'
                            }`}
                    >
                        {cat.label}
                        {activeCategory === cat.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-derma-gold"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Resources Grid */}
            <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {resources
                        .filter(r => {
                            if (activeCategory !== 'ALL' && r.type !== activeCategory) return false;
                            const isLocked = checkIsLocked(r);
                            if (isLocked && r.visibilityMode === 'HIDE') return false;
                            return true;
                        })
                        .map((resource) => {
                            const isLocked = checkIsLocked(resource);
                            const level = levels.find(l => l.id === resource.academyLevel);

                            return (
                                <div key={resource.id} className="group bg-white border border-derma-border rounded-sm overflow-hidden transition-luxury hover:shadow-premium hover:border-derma-gold flex flex-col h-full relative">
                                    <div className="relative h-52 bg-derma-cream overflow-hidden">
                                        <img
                                            src={resource.thumbnail}
                                            alt={resource.title}
                                            className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${isLocked ? 'blur-[2px] opacity-60' : ''}`}
                                        />
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            {isLocked && resource.visibilityMode === 'PREVIEW' && (
                                                <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-sm text-[8px] font-bold uppercase tracking-widest border border-amber-200 shadow-sm w-fit">
                                                    PREVIEW
                                                </span>
                                            )}
                                            {level && (
                                                <span className="bg-derma-black/80 backdrop-blur-sm px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-white border border-white/10 shadow-sm flex items-center gap-1 w-fit">
                                                    {level.icon} {level.label}
                                                </span>
                                            )}
                                        </div>

                                        {isLocked && (
                                            <div className="absolute inset-0 bg-white/40 flex flex-col items-center justify-center p-6 text-center">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-premium border border-derma-border mb-4">
                                                    <Lock size={20} className="text-derma-gold" />
                                                </div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-derma-black">
                                                    {resource.academyLevel === 'PREMIUM_ELITE' ? t('academy_lock_title_elite') : t('academy_lock_title_premium')}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[9px] font-bold text-derma-gold uppercase tracking-[2px]">{resource.category}</span>
                                            <div className="flex items-center gap-2 text-[10px] text-derma-text-muted font-light">
                                                <Clock size={12} /> {resource.duration}
                                            </div>
                                        </div>
                                        <h3 className="font-serif text-xl text-derma-black leading-snug uppercase tracking-tight mb-4 group-hover:text-derma-gold transition-colors">{resource.title}</h3>
                                        <p className="text-xs text-derma-text-muted font-light leading-relaxed mb-8 flex-1 line-clamp-3 italic">
                                            {resource.description || t('common_no_description')}
                                        </p>

                                        <div className="pt-6 border-t border-derma-border space-y-3">
                                            {isLocked ? (
                                                <button
                                                    className="w-full flex items-center justify-center gap-2 py-4 bg-derma-cream border border-derma-border text-[10px] font-bold uppercase tracking-widest text-derma-text-muted hover:bg-derma-gold hover:text-white hover:border-derma-gold transition-luxury group/btn"
                                                >
                                                    CONSULTER <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => setSelectedResource(resource)}
                                                        className="w-full flex items-center justify-center gap-2 py-4 bg-derma-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-derma-gold shadow-premium transition-luxury group/btn"
                                                    >
                                                        CONSULTER <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                    </button>
                                                    <button
                                                        onClick={() => markAsCompleted(resource.id)}
                                                        disabled={user.completedResources.includes(resource.id)}
                                                        className={`w-full py-2.5 border text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${user.completedResources.includes(resource.id)
                                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                                            : 'bg-white border-derma-border text-derma-black hover:border-emerald-500 hover:text-emerald-600'
                                                            }`}
                                                    >
                                                        {user.completedResources.includes(resource.id) ? (
                                                            <><CheckCircle size={12} /> COMPLÉTÉ</>
                                                        ) : (
                                                            'MARQUER COMME TERMINÉ'
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* Certification Status - Bottom Banner */}
            <div className={`p-12 rounded-sm text-white relative overflow-hidden shadow-deep transition-all duration-700 ${progressPercent === 100 ? 'bg-derma-blue-executive scale-[1.02]' : 'bg-gray-800 opacity-90'}`}>
                <div className="absolute top-0 right-0 w-80 h-80 bg-derma-gold opacity-5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-2 rounded-sm ${progressPercent === 100 ? 'bg-derma-gold/20' : 'bg-white/10'}`}>
                                <Award size={24} className={progressPercent === 100 ? 'text-derma-gold' : 'text-gray-400'} />
                            </div>
                            <h4 className="font-serif text-3xl uppercase tracking-tight">
                                {progressPercent === 100 ? t('academy_certificate_badge') : 'Certification en attente'}
                            </h4>
                        </div>
                        <p className="text-sm font-light text-blue-100/70 leading-relaxed">
                            {progressPercent === 100
                                ? "Félicitations ! Vous avez complété tous los módulos de su nivel actual. Su certificación oficial KRX Aesthetics ya está lista para su descarga."
                                : `Progreso actual: ${progressPercent}%. Complete todos los módulos para desbloquear su diploma oficial y validar sus competencias clínicas.`}
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 min-w-[240px]">
                        {progressPercent === 100 ? (
                            <button
                                onClick={() => setIsCertModalOpen(true)}
                                className="px-8 py-4 bg-derma-gold text-derma-black text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-white transition-luxury flex items-center justify-center gap-2 group"
                            >
                                <Download size={16} className="group-hover:bounce" /> {t('academy_certificate_download')}
                            </button>
                        ) : (
                            <div className="px-8 py-4 bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 flex items-center justify-center gap-2">
                                <Lock size={16} /> Verrouillé ({progressPercent}%)
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Certificate Modal */}
            <AnimatePresence>
                {isCertModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative max-w-[1200px] w-full bg-white p-2"
                        >
                            <button
                                onClick={() => setIsCertModalOpen(false)}
                                className="absolute -top-12 right-0 text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-derma-gold transition-colors"
                            >
                                <Lock size={16} /> Fermer
                            </button>

                            <div className="overflow-x-auto shadow-2xl">
                                <CertificateTemplate
                                    partnerName={user.name}
                                    instituteName={user.instituteName}
                                    levelName={user.tier === UserTier.STANDARD ? 'Standard' :
                                        user.tier === UserTier.PREMIUM_ELITE ? 'Elite' :
                                            user.tier === UserTier.PREMIUM_PRO ? 'Pro' : 'Premium'}
                                    issueDate={new Date().toLocaleDateString('fr-CH')}
                                    certificateCode={`DERMA-${user.id.slice(0, 4)}-${Math.random().toString(36).substring(7).toUpperCase()}`}
                                />
                            </div>

                            <div className="mt-8 flex justify-center pb-8">
                                <button
                                    onClick={() => window.print()}
                                    className="px-12 py-5 bg-derma-black text-white text-[12px] font-bold uppercase tracking-[0.3em] hover:bg-derma-gold transition-all flex items-center gap-3 shadow-xl"
                                >
                                    <Download size={20} /> Imprimer ou Sauvegarder PDF
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Content Viewer (Read-only) */}
            {selectedResource && selectedResource.contentUrl && (
                <ContentViewer
                    url={selectedResource.contentUrl}
                    type={selectedResource.type}
                    title={selectedResource.title}
                    onClose={() => setSelectedResource(null)}
                />
            )}
        </div>
    );
};

export default Academy;
