import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Users,
  GraduationCap,
  BookOpen,
  Award,
  MapPin,
  CheckCircle,
  Shield,
  Zap,
  Package,
  Truck,
  PlayCircle,
  Check,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';
import { supabase } from '../utils/supabase';

interface LandingPageProps {
  onNavigateToLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin }) => {
  const navigate = useNavigate();
  // --- STATE ---
  const [selectedTier, setSelectedTier] = useState<'STANDARD' | 'PREMIUM' | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger entry animations on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    nomInstitut: '',
    typeEtablissement: 'institut',
    tva: '',
    contactName: '',
    fonction: 'gerante',
    email: '',
    password: '',
    phone: '',
    rue: '',
    npa: '',
    ville: '',
    canton: 'Geneve',
    programme: 'indecis',
    conditions: false
  });
  const [formStatus, setFormStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('LOADING');
    setErrorMessage('');

    try {
      // 1. Supabase Auth SignUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('Erreur lors de la création du compte auth.');

      // Split name into first and last if possible
      const names = formData.contactName.trim().split(' ');
      const firstName = names[0] || '';
      const lastName = names.slice(1).join(' ') || '';

      // 2. Insert into partner_users (Pending)
      const { error: profileError } = await supabase
        .from('partner_users')
        .insert([
          {
            id: userId,
            email: formData.email,
            company_name: formData.nomInstitut,
            contact_name: formData.contactName,
            phone: formData.phone,
            status: 'pending'
          }
        ]);

      if (profileError) throw profileError;

      // 3. Insert into prospects (Legacy/Tracking)
      const { error: prospectError } = await supabase
        .from('prospects')
        .insert([
          {
            company_name: formData.nomInstitut,
            canton: formData.canton,
            contact_first_name: firstName,
            contact_last_name: lastName || firstName,
            contact_email: formData.email,
            contact_phone: formData.phone,
            company_type: formData.typeEtablissement.toUpperCase(),
            source: 'LANDING_PAGE',
            pipeline_stage: 'nouveau',
            lead_score: 0,
            is_premium_candidate: formData.programme === 'premium'
          }
        ]);

      if (prospectError) throw prospectError;

      setFormStatus('SUCCESS');

      // Reset form fields
      setFormData({
        nomInstitut: '',
        typeEtablissement: 'institut',
        tva: '',
        contactName: '',
        fonction: 'gerante',
        email: '',
        phone: '',
        rue: '',
        npa: '',
        ville: '',
        canton: 'Geneve',
        programme: 'indecis',
        conditions: false
      });

      // Reset status after 5s
      setTimeout(() => setFormStatus('IDLE'), 5000);

    } catch (err: any) {
      console.error('Error saving prospect:', err);
      setFormStatus('ERROR');
      setErrorMessage(err.message || 'Une erreur est survenue lors de l\'envoi du formulaire.');
    }
  };


  const scrollToForm = () => {
    document.getElementById('formulaire')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#FAFAF8] font-sans text-derma-black overflow-x-hidden">

      {/* 1. HEADER / NAVIGATION */}
      <nav
        className={`fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-derma-border transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="font-oswald text-2xl tracking-[0.1em] text-derma-black">
              DERMAKOR <span className="text-derma-gold">SWISS</span>
            </h1>
            <span className="text-[9px] uppercase tracking-[0.25em] text-gray-400">Distributeur Exclusif</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-4 text-xs font-medium text-gray-500">
              <span className="text-derma-black">FR</span>
              <span className="hover:text-derma-black cursor-pointer transition-colors">DE</span>
              <span className="hover:text-derma-black cursor-pointer transition-colors">IT</span>
            </div>
            <button
              onClick={onNavigateToLogin}
              className="text-sm font-medium hover:text-derma-gold transition-colors"
            >
              Espace Partenaire
            </button>
            <button
              onClick={scrollToForm}
              className="bg-derma-black text-white px-6 py-2.5 rounded text-xs uppercase tracking-widest hover:bg-derma-gold transition-colors"
            >
              Devenir Partenaire →
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-[90vh] flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            className={`space-y-8 transition-all duration-1000 delay-100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-derma-gold/10 text-derma-gold rounded-full text-xs font-bold uppercase tracking-wider border border-derma-gold/20">
              <Star size={12} fill="currentColor" /> Distributeur Exclusif depuis 2025
            </div>

            <h1 className="font-oswald text-5xl md:text-7xl font-light uppercase leading-[1.1]">
              Rejoignez les +40 instituts d'élite qui font confiance à <span className="text-derma-gold">KRX</span>
            </h1>

            <p className="text-lg text-gray-500 max-w-xl font-light leading-relaxed">
              Transformez votre institut avec plus de 130 produits de haute technologie. Formation certifiante, protocoles exclusifs et support Suisse dédié.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={scrollToForm}
                className="bg-derma-gold hover:bg-[#B08D55] text-white px-8 py-4 text-sm uppercase tracking-widest font-semibold rounded shadow-premium hover:shadow-premium-hover transition-all transform hover:-translate-y-1"
              >
                Planifier un rendez-vous conseil
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-500 px-4 py-3 bg-white border border-gray-100 rounded shadow-sm">
                <span className="text-green-500">🎁</span> 1ère livraison OFFERTE
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { label: "Conseiller dédié 48-72h", icon: Users },
                { label: "Masterclass incluses", icon: GraduationCap },
                { label: "Protocoles à vie", icon: BookOpen },
                { label: "Certificat officiel KRX", icon: Award },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="p-1.5 bg-gray-100 rounded-full text-derma-black">
                    <item.icon size={14} />
                  </div>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div
            className={`relative h-[500px] md:h-[600px] w-full rounded-lg overflow-hidden shadow-2xl transition-all duration-1000 delay-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          >
            {/* Mock Hero Image */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
              <img
                src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=2070&auto=format&fit=crop"
                alt="KRX Products"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-black/10"></div>
            </div>

            {/* Floating Badge */}
            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur p-4 rounded border-l-4 border-derma-gold shadow-lg max-w-xs animate-slide-up">
              <p className="font-oswald text-lg text-derma-black">"Une révolution pour mon institut."</p>
              <p className="text-xs text-gray-500 mt-1">Sophie M., Partenaire Premium à Genève</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOCIAL PROOF */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="font-oswald text-2xl text-derma-black mb-2 uppercase">+40 instituts nous font déjà confiance</h2>
          <p className="text-gray-400 text-sm mb-10">Dans toute la Suisse Romande et Alémanique</p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 opacity-60">
            {['Genève', 'Lausanne', 'Fribourg', 'Neuchâtel', 'Vaud', 'Valais', 'Berne', 'Zurich'].map((city) => (
              <div key={city} className="flex flex-col items-center gap-2 group cursor-default">
                <MapPin size={20} className="text-gray-300 group-hover:text-derma-gold transition-colors" />
                <span className="text-xs font-medium uppercase tracking-wider">{city}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TIER COMPARISON */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-oswald text-3xl md:text-4xl uppercase tracking-wide text-derma-black">Choisissez votre programme</h2>
          <div className="w-20 h-1 bg-derma-gold mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* STANDARD */}
          <div
            className={`bg-white rounded-xl border p-8 transition-all duration-300 relative overflow-hidden cursor-pointer hover:-translate-y-1 ${selectedTier === 'STANDARD' ? 'border-derma-black shadow-xl' : 'border-gray-200 shadow-sm hover:shadow-md'}`}
            onClick={() => setSelectedTier('STANDARD')}
          >
            <div className="mb-6">
              <h3 className="font-oswald text-2xl text-derma-black mb-2">STANDARD</h3>
              <p className="text-sm text-gray-500">L'essentiel pour démarrer</p>
            </div>

            <div className="mb-8 pb-8 border-b border-gray-100">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-oswald text-derma-black">CHF 800</span>
                <span className="text-xs text-gray-400 uppercase">1ère Commande</span>
              </div>
              <div className="inline-block bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded mb-4">
                🎁 Livraison OFFERTE
              </div>
              <p className="text-sm font-medium text-derma-black">Puis CHF 300 / mois</p>
              <p className="text-xs text-gray-400">Engagement 6 mois</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                "Accès catalogue Homme Care uniquement",
                "Tarifs professionnels Homme Care",
                "Protocoles Homme Care à vie",
                "Formation de base",
                "Support technique standard",
                "Certificat KRX Homme Care"
              ].map(feat => (
                <li key={feat} className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>

            <button onClick={scrollToForm} className="w-full py-4 bg-derma-blue text-white rounded text-sm font-semibold hover:bg-derma-blueDark transition-colors">
              PLANIFIER RDV STANDARD →
            </button>
          </div>

          {/* PREMIUM */}
          <div
            className={`bg-white rounded-xl border-2 p-8 transition-all duration-300 relative overflow-hidden cursor-pointer hover:-translate-y-2 ${selectedTier === 'PREMIUM' ? 'border-derma-gold shadow-premium' : 'border-derma-gold/30 shadow-lg'}`}
            onClick={() => setSelectedTier('PREMIUM')}
          >
            <div className="absolute top-0 right-0 bg-gradient-to-r from-derma-gold to-[#D4B87C] text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-lg uppercase tracking-wider">
              ⭐ Recommandé
            </div>

            <div className="mb-6">
              <h3 className="font-oswald text-2xl text-derma-black mb-2 flex items-center gap-2">PREMIUM <span className="text-derma-gold">⭐</span></h3>
              <p className="text-sm text-gray-500">L'expérience élite complète</p>
            </div>

            <div className="mb-8 pb-8 border-b border-dashed border-derma-gold/30">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-oswald text-derma-gold">CHF 1,500</span>
                <span className="text-xs text-gray-400 uppercase">1ère Commande</span>
              </div>
              <div className="inline-block bg-derma-gold/10 text-derma-gold text-[10px] font-bold px-2 py-0.5 rounded mb-4">
                🎁 Livraison OFFERTE
              </div>
              <p className="text-sm font-medium text-derma-black">Puis CHF 800 / mois</p>
              <p className="text-xs text-gray-400">Engagement 6 mois</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                "Accès catalogue complet +130 produits KRX",
                "Tarifs Premium (-10% supplémentaire)",
                "Tous les protocoles à vie",
                "Masterclass exclusives",
                "Conseiller VIP dédié",
                "Priorité sur le stock",
                "Nouveautés en avant-première",
                "Échantillons exclusifs",
                "Certificat KRX complet"
              ].map(feat => (
                <li key={feat} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                  <CheckCircle size={16} className="text-derma-gold mt-0.5 shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>

            <button onClick={scrollToForm} className="w-full py-4 bg-gradient-to-r from-derma-gold to-[#D4B87C] text-white rounded text-sm font-semibold hover:shadow-lg transition-all btn-shine">
              PLANIFIER RDV PREMIUM →
            </button>
          </div>
        </div>
      </section>

      {/* 5. USPs */}
      <section className="bg-[#FAFAF8] py-20 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-oswald text-3xl text-center mb-16 uppercase text-derma-black">Pourquoi +40 instituts choisissent DermaKor Swiss</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Distributeur Exclusif", text: "Seul distributeur KRX officiel en Suisse depuis 2025. Authenticité garantie." },
              { icon: Package, title: "Catalogue Complet", text: "+130 références professionnelles: ampoules, peelings, masques, sérums..." },
              { icon: GraduationCap, title: "Formation Certifiante", text: "Masterclass régulières, Academy 24/7 et certificat reconnu." },
              { icon: Zap, title: "Stock Local Suisse", text: "Disponibilité immédiate garantie. Pas d'attente d'importation." },
              { icon: Truck, title: "Livraison Express", text: "24-48h partout en Suisse. 1ère livraison toujours offerte." },
              { icon: Users, title: "Support en Français", text: "Équipe Suisse romande dédiée disponible pour vous accompagner." },
            ].map((usp, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-lg border border-gray-100 hover:border-derma-gold/50 transition-colors shadow-sm group animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-derma-black mb-6 group-hover:bg-derma-gold group-hover:text-white transition-colors">
                  <usp.icon size={24} />
                </div>
                <h3 className="font-oswald text-lg mb-3">{usp.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{usp.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PROCESS */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-oswald text-3xl uppercase mb-2">Comment devenir partenaire</h2>
            <p className="text-gray-500 text-sm">Un processus simple en 4 étapes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>

            {[
              { num: "01", title: "Postulez", desc: "Formulaire 2 min", detail: "Infos institut" },
              { num: "02", title: "Conseiller", desc: "RDV en 48h", detail: "Appel dédié" },
              { num: "03", title: "Commandez", desc: "1ère commande", detail: "Livraison offerte" },
              { num: "04", title: "Formation", desc: "Accès Academy", detail: "Certificat KRX" },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center bg-white">
                <div className="w-12 h-12 bg-derma-black text-white rounded-full flex items-center justify-center font-oswald text-lg mb-4 ring-4 ring-white">
                  {step.num}
                </div>
                <h3 className="font-oswald text-lg uppercase mb-1">{step.title}</h3>
                <p className="text-sm font-bold text-derma-gold mb-1">{step.desc}</p>
                <p className="text-xs text-gray-400">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. ACADEMY HIGHLIGHT */}
      <section className="py-20 px-6 bg-[#1A1A1A] text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-oswald text-3xl md:text-5xl uppercase leading-tight mb-6">
              KRX Academy <br /><span className="text-derma-gold">Formation Incluse</span>
            </h2>
            <p className="text-gray-400 text-lg font-light mb-8">
              Ne vous contentez pas d'acheter des produits. Maîtrisez les protocoles qui feront la réputation de votre institut.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="p-3 bg-white/5 rounded h-fit"><PlayCircle className="text-derma-gold" /></div>
                <div>
                  <h3 className="font-oswald text-xl mb-1">Protocoles Vidéo HD</h3>
                  <p className="text-sm text-gray-400">Accès 24/7 à +50 tutoriels détaillés.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="p-3 bg-white/5 rounded h-fit"><Users className="text-derma-gold" /></div>
                <div>
                  <h3 className="font-oswald text-xl mb-1">Masterclass Live</h3>
                  <p className="text-sm text-gray-400">Sessions Q&A avec nos experts formateurs.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="p-3 bg-white/5 rounded h-fit"><Award className="text-derma-gold" /></div>
                <div>
                  <h3 className="font-oswald text-xl mb-1">Certificat Officiel</h3>
                  <p className="text-sm text-gray-400">Badge "Certified KRX Professional" pour votre vitrine.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative border border-white/10 rounded-lg p-4 bg-white/5 backdrop-blur">
            <div className="aspect-video bg-gray-800 rounded flex items-center justify-center relative overflow-hidden group cursor-pointer">
              <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop" alt="Academy Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
              <PlayCircle size={64} className="text-white relative z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* 8. FORM SECTION */}
      <section id="formulaire" className="py-24 px-6 bg-white relative">
        <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden relative z-10">
          <div className="bg-derma-black p-8 text-center text-white">
            <h2 className="font-oswald text-2xl md:text-3xl uppercase tracking-wide mb-2">Planifier votre rendez-vous conseil</h2>
            <p className="text-gray-400 text-sm">Un expert vous contactera sous 48-72h</p>
          </div>

          <div className="p-8 md:p-12">
            {formStatus === 'SUCCESS' ? (
              <div
                className="text-center py-12 animate-fade-in"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} />
                </div>
                <h3 className="font-oswald text-2xl text-derma-black mb-2">Demande Envoyée !</h3>
                <p className="text-gray-500">Merci. Un conseiller DermaKor vous contactera muy pronto.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-8">
                {formStatus === 'ERROR' && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                )}
                {/* 1. Institut */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-derma-gold border-b border-gray-100 pb-2">Informations Institut</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nom de l'institut *</label>
                      <input
                        required
                        type="text"
                        value={formData.nomInstitut}
                        onChange={e => setFormData({ ...formData, nomInstitut: e.target.value })}
                        className="w-full border border-gray-300 rounded p-2.5 text-sm focus:border-derma-gold focus:ring-1 focus:ring-derma-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                      <select
                        className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white"
                        value={formData.typeEtablissement}
                        onChange={e => setFormData({ ...formData, typeEtablissement: e.target.value })}
                      >
                        <option value="institut">Institut de beauté</option>
                        <option value="spa">Spa / Wellness</option>
                        <option value="clinique">Clinique esthétique</option>
                        <option value="medical">Cabinet médical</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Contact */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-derma-gold border-b border-gray-100 pb-2">Contact Principal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nom et Prénom *</label>
                      <input
                        required
                        type="text"
                        value={formData.contactName}
                        onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                        className="w-full border border-gray-300 rounded p-2.5 text-sm outline-none focus:border-derma-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email Pro *</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border border-gray-300 rounded p-2.5 text-sm outline-none focus:border-derma-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone *</label>
                      <input
                        required
                        type="tel"
                        placeholder="+41"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded p-2.5 text-sm outline-none focus:border-derma-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Canton *</label>
                      <select
                        className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white"
                        value={formData.canton}
                        onChange={e => setFormData({ ...formData, canton: e.target.value })}
                      >
                        <option value="Geneve">Genève</option>
                        <option value="Vaud">Vaud</option>
                        <option value="Valais">Valais</option>
                        <option value="Fribourg">Fribourg</option>
                        <option value="Neuchatel">Neuchâtel</option>
                        <option value="Jura">Jura</option>
                        <option value="Berne">Berne</option>
                        <option value="Zurich">Zurich</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Program */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-derma-gold border-b border-gray-100 pb-2">Intérêt</h3>
                  <div className="space-y-2">
                    {[
                      { val: 'standard', label: 'Programme Standard (CHF 800 initial)' },
                      { val: 'premium', label: 'Programme Premium (CHF 1,500 initial) ⭐' },
                      { val: 'indecis', label: 'Je souhaite être conseillé(e)' }
                    ].map(opt => (
                      <label key={opt.val} className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="prog"
                          value={opt.val}
                          checked={formData.programme === opt.val}
                          onChange={e => setFormData({ ...formData, programme: e.target.value })}
                          className="text-derma-gold focus:ring-derma-gold"
                        />
                        <span className="text-sm text-derma-black">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-4">
                  <input
                    required
                    type="checkbox"
                    id="conditions"
                    checked={formData.conditions}
                    onChange={e => setFormData({ ...formData, conditions: e.target.checked })}
                    className="mt-1"
                  />
                  <label htmlFor="conditions" className="text-xs text-gray-500">
                    J'accepte d'être contacté(e) par DermaKor Swiss pour discuter du partenariat. Je comprends que ceci est une demande de contact et non un engagement contractuel immédiat.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={formStatus === 'LOADING'}
                  className="w-full bg-derma-gold hover:bg-[#B08D55] text-white py-4 rounded text-sm uppercase tracking-widest font-bold shadow-lg transition-all flex justify-center items-center gap-2"
                >
                  {formStatus === 'LOADING' ? 'Envoi en cours...' : 'Planifier mon RDV Conseil →'}
                </button>
                <p className="text-center text-xs text-gray-400">🎁 1ère Livraison OFFERTE pour toute validation de partenariat</p>

              </form>
            )}
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="py-20 px-6 bg-[#FAFAF8] border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-oswald text-3xl text-center mb-12 text-derma-black">Questions Fréquentes</h2>
          <div className="space-y-4">
            {[
              { q: "Qui peut devenir partenaire ?", a: "Tout institut de beauté, spa, clinique ou cabinet médical en Suisse disposant d'un numéro IDE/TVA valide." },
              { q: "Quel est l'investissement initial ?", a: "Standard: commande initiale de CHF 800. Premium: commande initiale de CHF 1,500. Aucun frais d'inscription ou de dossier." },
              { q: "Y a-t-il un engagement ?", a: "Oui, un engagement de 6 mois est demandé (CHF 300/mois en Standard, CHF 800/mois en Premium) pour garantir l'exclusivité et le suivi." },
              { q: "Puis-je changer de programme ?", a: "Absolument. Vous pouvez passer du programme Standard au Premium à tout moment pour bénéficier des avantages supérieurs." }
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="w-full flex justify-between items-center p-5 text-left hover:bg-gray-50"
                >
                  <span className="font-medium text-derma-black">{item.q}</span>
                  {openFaqIndex === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openFaqIndex === i && (
                  <div className="p-5 pt-0 text-sm text-gray-500 bg-gray-50/50">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-derma-black to-[#2C3E50] text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-oswald text-4xl md:text-5xl uppercase mb-6">Offre de Lancement 2025</h2>
          <p className="text-xl font-light text-gray-300 mb-10">
            Rejoignez l'élite de l'esthétique Suisse avant la fin du mois et recevez un <span className="text-derma-gold font-bold">Kit Découverte (valeur CHF 150)</span> en plus de la livraison offerte.
          </p>
          <button
            onClick={scrollToForm}
            className="bg-white text-derma-black hover:bg-derma-gold hover:text-white px-10 py-4 rounded text-sm font-bold uppercase tracking-widest transition-all shadow-2xl"
          >
            Je profite de l'offre →
          </button>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-[#111] text-gray-500 py-16 px-6 text-sm border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-oswald text-white text-lg uppercase tracking-widest mb-4">DermaKor Swiss</h3>
            <p className="max-w-sm mb-6">Distributeur exclusif KRX Aesthetics pour la Suisse. Nous fournissons aux professionnels de l'esthétique les outils, produits et formations nécessaires pour exceller.</p>
            <div className="flex gap-4">
              {/* Social icons placeholders */}
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center hover:bg-derma-gold hover:text-white transition-colors cursor-pointer">IG</div>
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center hover:bg-derma-gold hover:text-white transition-colors cursor-pointer">LI</div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li className="hover:text-derma-gold cursor-pointer transition-colors">Devenir Partenaire</li>
              <li className="hover:text-derma-gold cursor-pointer transition-colors">Catalogue Produits</li>
              <li className="hover:text-derma-gold cursor-pointer transition-colors">KRX Academy</li>
              <li onClick={onNavigateToLogin} className="hover:text-derma-gold cursor-pointer transition-colors">Espace Membre</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-2">
              <li>Genève, Suisse</li>
              <li>partenaires@dermakor.ch</li>
              <li>+41 22 555 00 00</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>© 2025 DermaKor Swiss Sàrl. Tous droits réservés.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="hover:text-white cursor-pointer">Conditions Générales</span>
            <span className="hover:text-white cursor-pointer">Politique de Confidentialité</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;