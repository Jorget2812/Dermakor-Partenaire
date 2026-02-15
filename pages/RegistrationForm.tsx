import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail,
    Phone,
    MapPin,
    Building2,
    ChevronRight,
    CheckCircle2,
    Star,
    Loader2,
    ArrowLeft,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabase';

type Tier = 'STANDARD' | 'PREMIUM';

const RegistrationForm: React.FC = () => {
    const navigate = useNavigate();
    const [selectedTier, setSelectedTier] = useState<Tier>('PREMIUM');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zip: '',
        notes: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.company_name) newErrors.company_name = "Le nom de l'institut est requis";
        if (!formData.contact_name) newErrors.contact_name = "Le nom du responsable est requis";
        if (!formData.email) {
            newErrors.email = "L'email est requis";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Format d'email invalide";
        }
        if (!formData.phone) newErrors.phone = "Le numéro de téléphone est requis";
        if (!formData.address) newErrors.address = "L'adresse est requise";
        if (!formData.city) newErrors.city = "La ville est requise";
        if (!formData.zip) newErrors.zip = "Le code postal est requis";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('prospects')
                .insert([{
                    ...formData,
                    tier: selectedTier,
                    status: 'pending'
                }]);

            if (error) throw error;

            setShowSuccess(true);
        } catch (err: any) {
            console.error('Registration Error:', err);
            alert('Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    const features = {
        STANDARD: [
            "Accès catalogue Homme Care uniquement",
            "Tarifs professionnels Homme Care",
            "Protocoles Homme Care à vie",
            "Formation de base",
            "Support technique standard"
        ],
        PREMIUM: [
            "Accès catalogue complet +130 produits KRX",
            "Tarifs Premium (-10% supplémentaire)",
            "Tous les protocoles à vie",
            "Masterclass exclusives",
            "Priorité sur le stock",
            "Nouveautés en avant-première"
        ]
    };

    return (
        <div className="min-h-screen bg-[#FAFAF8] font-sans text-derma-black py-12 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center mb-12"
                >
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-derma-gold transition-colors"
                    >
                        <ArrowLeft size={16} /> Retour à l'accueil
                    </button>
                    <div className="text-right">
                        <h1 className="font-oswald text-2xl tracking-[0.2em]">DERMAKOR <span className="text-derma-gold">SWISS</span></h1>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Strategic Partner Ecosystem</p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

                    {/* Left Column: Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        <div className="bg-white rounded-xl shadow-premium p-8 border border-derma-border relative overflow-hidden">
                            {/* Gold separator line fade animation would go here if defined in CSS, using motion instead */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '80px' }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-1 bg-derma-gold mb-8"
                            />

                            <h2 className="font-oswald text-3xl uppercase tracking-wider mb-2">Devenir Partenaire Stratégique</h2>
                            <p className="text-gray-500 text-sm mb-10 font-light italic">Rejoignez l'élite de l'esthétique professionnelle en Suisse.</p>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Tier Selection */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Sélectionnez votre programme</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(['STANDARD', 'PREMIUM'] as Tier[]).map((tier) => (
                                            <motion.div
                                                key={tier}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={() => setSelectedTier(tier)}
                                                className={`relative cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${selectedTier === tier
                                                    ? 'border-derma-gold bg-derma-gold/5 shadow-[0_0_20px_rgba(192,167,106,0.15)]'
                                                    : 'border-gray-100 opacity-70 grayscale hover:opacity-100 hover:grayscale-0'
                                                    }`}
                                            >
                                                {tier === 'PREMIUM' && (
                                                    <div className="absolute top-0 right-0 bg-derma-gold text-white text-[8px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-tighter">
                                                        RECOMMANDÉ ⭐
                                                    </div>
                                                )}
                                                <h3 className={`font-oswald text-xl mb-1 ${selectedTier === tier ? 'text-derma-gold' : 'text-derma-black'}`}>
                                                    {tier}
                                                </h3>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">
                                                    {tier === 'PREMIUM' ? "L'expérience élite complète" : "L'essentiel pour démarrer"}
                                                </p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-xl font-oswald">CHF {tier === 'PREMIUM' ? '1,500' : '800'}</span>
                                                    <span className="text-[10px] text-gray-400">1ère Commande</span>
                                                </div>
                                                <p className="text-[9px] text-green-600 font-bold mt-1 uppercase tracking-tighter">🎁 1ère livraison OFFERTE</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Nom de l'institut / Entreprise *</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                name="company_name"
                                                value={formData.company_name}
                                                onChange={handleInputChange}
                                                className={`w-full bg-[#FAFAF9] border ${errors.company_name ? 'border-red-500' : 'border-[#E5E5E5] group-hover:border-derma-gold/50'} rounded p-4 text-sm focus:outline-none focus:border-derma-gold focus:ring-4 focus:ring-derma-gold/5 transition-all duration-300`}
                                                placeholder="Saisissez le nom officiel"
                                            />
                                            <Building2 size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.company_name ? 'text-red-500' : 'text-gray-300 group-focus-within:text-derma-gold'}`} />
                                        </div>
                                        {errors.company_name && <p className="text-[10px] text-red-500 font-medium pl-1 border-l-2 border-derma-gold ml-1">{errors.company_name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Nom du responsable *</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                name="contact_name"
                                                value={formData.contact_name}
                                                onChange={handleInputChange}
                                                className={`w-full bg-[#FAFAF9] border ${errors.contact_name ? 'border-red-500' : 'border-[#E5E5E5] group-hover:border-derma-gold/50'} rounded p-4 text-sm focus:outline-none focus:border-derma-gold focus:ring-4 focus:ring-derma-gold/5 transition-all duration-300`}
                                                placeholder="Prénom & Nom"
                                            />
                                        </div>
                                        {errors.contact_name && <p className="text-[10px] text-red-500 font-medium pl-1 border-l-2 border-derma-gold ml-1">{errors.contact_name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Email Professionnel *</label>
                                        <div className="relative group">
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full bg-[#FAFAF9] border ${errors.email ? 'border-red-500' : 'border-[#E5E5E5] group-hover:border-derma-gold/50'} rounded p-4 text-sm focus:outline-none focus:border-derma-gold focus:ring-4 focus:ring-derma-gold/5 transition-all duration-300`}
                                                placeholder="contact@votreinstitut.ch"
                                            />
                                            <Mail size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.email ? 'text-red-500' : 'text-gray-300 group-focus-within:text-derma-gold'}`} />
                                        </div>
                                        {errors.email && <p className="text-[10px] text-red-500 font-medium pl-1 border-l-2 border-derma-gold ml-1">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Téléphone *</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className={`w-full bg-[#FAFAF9] border ${errors.phone ? 'border-red-500' : 'border-[#E5E5E5] group-hover:border-derma-gold/50'} rounded p-4 text-sm focus:outline-none focus:border-derma-gold focus:ring-4 focus:ring-derma-gold/5 transition-all duration-300`}
                                                placeholder="+41 XX XXX XX XX"
                                            />
                                            <Phone size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.phone ? 'text-red-500' : 'text-gray-300 group-focus-within:text-derma-gold'}`} />
                                        </div>
                                        {errors.phone && <p className="text-[10px] text-red-500 font-medium pl-1 border-l-2 border-derma-gold ml-1">{errors.phone}</p>}
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Adresse Complète *</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className={`w-full bg-[#FAFAF9] border ${errors.address ? 'border-red-500' : 'border-[#E5E5E5] group-hover:border-derma-gold/50'} rounded p-4 text-sm focus:outline-none focus:border-derma-gold focus:ring-4 focus:ring-derma-gold/5 transition-all duration-300`}
                                                placeholder="Rue et numéro"
                                            />
                                            <MapPin size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.address ? 'text-red-500' : 'text-gray-300 group-focus-within:text-derma-gold'}`} />
                                        </div>
                                        {errors.address && <p className="text-[10px] text-red-500 font-medium pl-1 border-l-2 border-derma-gold ml-1">{errors.address}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Ville *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className={`w-full bg-[#FAFAF9] border ${errors.city ? 'border-red-500' : 'border-[#E5E5E5] hover:border-derma-gold/50'} rounded p-4 text-sm focus:outline-none focus:border-derma-gold focus:ring-4 focus:ring-derma-gold/5 transition-all duration-300`}
                                        />
                                        {errors.city && <p className="text-[10px] text-red-500 font-medium pl-1 border-l-2 border-derma-gold ml-1">{errors.city}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Code Postal *</label>
                                        <input
                                            type="text"
                                            name="zip"
                                            value={formData.zip}
                                            onChange={handleInputChange}
                                            className={`w-full bg-[#FAFAF9] border ${errors.zip ? 'border-red-500' : 'border-[#E5E5E5] hover:border-derma-gold/50'} rounded p-4 text-sm focus:outline-none focus:border-derma-gold focus:ring-4 focus:ring-derma-gold/5 transition-all duration-300`}
                                        />
                                        {errors.zip && <p className="text-[10px] text-red-500 font-medium pl-1 border-l-2 border-derma-gold ml-1">{errors.zip}</p>}
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Informations Complémentaires</label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full bg-[#FAFAF9] border border-[#E5E5E5] hover:border-derma-gold/50 rounded p-4 text-sm focus:outline-none focus:border-derma-gold focus:ring-4 focus:ring-derma-gold/5 transition-all duration-300 resize-none"
                                            placeholder="Projets spécifiques, questions, demandes particulières..."
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isLoading}
                                    type="submit"
                                    className={`w-full py-5 rounded text-sm uppercase font-bold tracking-[0.3em] transition-all duration-300 shadow-xl flex items-center justify-center gap-3 ${selectedTier === 'PREMIUM' ? 'bg-derma-gold text-white hover:bg-[#B08D55]' : 'bg-derma-black text-white hover:bg-[#333]'
                                        }`}
                                >
                                    {isLoading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>Soumettre ma demande <ChevronRight size={18} /></>
                                    )}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>

                    {/* Right Column: Benefits Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white rounded-xl shadow-premium border border-derma-border p-8 sticky top-12">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-derma-gold mb-6 border-b border-derma-gold/10 pb-4">
                                Vous avez choisi: <span className="text-derma-black font-oswald text-lg ml-2">{selectedTier}</span>
                            </h3>

                            <div className="space-y-6">
                                {features[selectedTier].map((f, i) => (
                                    <motion.div
                                        key={f}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex gap-4"
                                    >
                                        <div className={`p-1 rounded-full h-fit flex-shrink-0 ${selectedTier === 'PREMIUM' ? 'bg-derma-gold/10 text-derma-gold' : 'bg-green-50 text-green-600'}`}>
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600 leading-relaxed uppercase tracking-wider">{f}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-12 p-6 bg-[#FAFAF8] rounded-xl border border-dashed border-gray-200">
                                <Shield className="text-derma-gold mb-3" size={24} />
                                <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">Qualité Garantie</h4>
                                <p className="text-[9px] text-gray-400 uppercase tracking-tighter italic">Processus de sélection rigoureux pour maintenir l'exclusivité du réseau Dermakor Swiss.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-derma-black/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-derma-gold" />
                            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="font-oswald text-2xl uppercase tracking-[0.2em] mb-4">Demande reçue ✓</h2>
                            <p className="text-gray-500 text-sm mb-8 font-light leading-relaxed">
                                Merci de votre intérêt pour Dermakor Swiss. <br />
                                Nous examinerons votre candidature sous **48h**. <br />
                                Vous recevrez un email de confirmation sous peu.
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-4 bg-derma-black text-white rounded text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-derma-gold transition-all duration-300"
                            >
                                Retour à l'accueil
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RegistrationForm;
