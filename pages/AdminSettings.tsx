import React, { useState } from 'react';
import { User, Lock, Bell, Globe, Save, Shield, AlertCircle } from 'lucide-react';

type SettingsTab = 'PROFILE' | 'SECURITY' | 'NOTIFICATIONS' | 'REGION';

const AdminSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('PROFILE');

    // Notification States
    const [notifSettings, setNotifSettings] = useState({
        orders: true,
        partners: true,
        stock: true,
        system: false
    });

    // Region States
    const [regionSettings, setRegionSettings] = useState({
        language: 'fr',
        timezone: 'Europe/Zurich',
        dateFormat: 'DD.MM.YYYY'
    });

    // Function to simulate saving
    const handleSave = () => {
        // Logic to show a success toast or similar could be added here
        alert("Paramètres enregistrés avec succès.");
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'PROFILE':
                return (
                    <div className="space-y-6 animate-fade-in">
                        {/* Profile Section from original code */}
                        <div className="bg-white border border-[#E8E8E8] rounded-lg p-8">
                            <h3 className="font-oswald text-lg text-[#1A1A1A] mb-6 border-b border-[#F5F5F5] pb-4">Profil Administrateur</h3>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-[11px] uppercase text-[#6B6B6B] font-bold mb-2">Prénom</label>
                                    <input type="text" defaultValue="Jorge" className="w-full bg-[#FAFAF8] border border-[#E0E0E0] rounded p-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]" />
                                </div>
                                <div>
                                    <label className="block text-[11px] uppercase text-[#6B6B6B] font-bold mb-2">Nom</label>
                                    <input type="text" defaultValue="Torres" className="w-full bg-[#FAFAF8] border border-[#E0E0E0] rounded p-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]" />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-[11px] uppercase text-[#6B6B6B] font-bold mb-2">Email</label>
                                <input type="email" defaultValue="jorge@dermakor.ch" className="w-full bg-[#FAFAF8] border border-[#E0E0E0] rounded p-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]" />
                            </div>

                            <div className="flex justify-end">
                                <button onClick={handleSave} className="bg-[#1A1A1A] text-white px-6 py-2 rounded text-sm font-medium flex items-center gap-2 hover:bg-[#2C3E50] transition-colors">
                                    <Save size={16} /> Enregistrer
                                </button>
                            </div>
                        </div>

                        {/* System Info */}
                        <div className="bg-white border border-[#E8E8E8] rounded-lg p-8">
                            <h3 className="font-oswald text-lg text-[#1A1A1A] mb-6 border-b border-[#F5F5F5] pb-4">Information Système</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm items-center p-2 hover:bg-[#FAFAF8] rounded">
                                    <span className="text-[#6B6B6B]">Version</span>
                                    <span className="font-mono text-[#1A1A1A] bg-[#F5F5F5] px-2 py-1 rounded text-xs">v2.4.0 (Stable)</span>
                                </div>
                                <div className="flex justify-between text-sm items-center p-2 hover:bg-[#FAFAF8] rounded">
                                    <span className="text-[#6B6B6B]">Environnement</span>
                                    <span className="font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded text-xs border border-[#10B981]/20">Production</span>
                                </div>
                                <div className="flex justify-between text-sm items-center p-2 hover:bg-[#FAFAF8] rounded">
                                    <span className="text-[#6B6B6B]">Dernière sauvegarde</span>
                                    <span className="font-mono text-[#1A1A1A]">Aujourd'hui, 04:00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'SECURITY':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white border border-[#E8E8E8] rounded-lg p-8">
                            <h3 className="font-oswald text-lg text-[#1A1A1A] mb-6 border-b border-[#F5F5F5] pb-4 flex items-center gap-2">
                                <Lock size={18} /> Sécurité du Compte
                            </h3>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-[11px] uppercase text-[#6B6B6B] font-bold mb-2">Mot de passe actuel</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-[#FAFAF8] border border-[#E0E0E0] rounded p-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] uppercase text-[#6B6B6B] font-bold mb-2">Nouveau mot de passe</label>
                                        <input type="password" placeholder="••••••••" className="w-full bg-[#FAFAF8] border border-[#E0E0E0] rounded p-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] uppercase text-[#6B6B6B] font-bold mb-2">Confirmer</label>
                                        <input type="password" placeholder="••••••••" className="w-full bg-[#FAFAF8] border border-[#E0E0E0] rounded p-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]" />
                                    </div>
                                </div>
                                <div className="bg-blue-50 text-blue-800 p-3 rounded text-xs flex gap-2 border border-blue-100">
                                    <AlertCircle size={14} className="mt-0.5" />
                                    Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre.
                                </div>
                            </div>

                            <div className="pt-6 border-t border-[#F5F5F5]">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-[#1A1A1A]">Authentification à deux facteurs (2FA)</h4>
                                        <p className="text-xs text-[#6B6B6B] mt-1">Ajoute une couche de sécurité supplémentaire à votre compte.</p>
                                    </div>
                                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-[#E0E0E0] checked:right-0 checked:border-[#10B981]" />
                                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-[#E0E0E0] cursor-pointer"></label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6">
                                <button onClick={handleSave} className="bg-[#1A1A1A] text-white px-6 py-2 rounded text-sm font-medium flex items-center gap-2 hover:bg-[#2C3E50] transition-colors">
                                    <Save size={16} /> Mettre à jour
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'NOTIFICATIONS':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white border border-[#E8E8E8] rounded-lg p-8">
                            <h3 className="font-oswald text-lg text-[#1A1A1A] mb-6 border-b border-[#F5F5F5] pb-4 flex items-center gap-2">
                                <Bell size={18} /> Préférences de Notification
                            </h3>

                            <div className="space-y-0 divide-y divide-[#F5F5F5]">
                                {[
                                    { id: 'orders', label: 'Nouvelles Commandes', desc: 'Recevoir un email à chaque nouvelle commande validée.' },
                                    { id: 'partners', label: 'Inscriptions Partenaires', desc: 'Notification lorsqu\'un nouvel institut s\'inscrit.' },
                                    { id: 'stock', label: 'Alertes Stock Faible', desc: 'Avertissement quand un produit passe sous le seuil critique.' },
                                    { id: 'system', label: 'Mises à jour Système', desc: 'Informations sur les maintenances et nouvelles fonctionnalités.' }
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                        <div>
                                            <h4 className="text-sm font-bold text-[#1A1A1A]">{item.label}</h4>
                                            <p className="text-xs text-[#6B6B6B] mt-1">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => setNotifSettings(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notifSettings] }))}
                                            className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${notifSettings[item.id as keyof typeof notifSettings] ? 'bg-[#1A1A1A]' : 'bg-gray-200'}`}
                                        >
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${notifSettings[item.id as keyof typeof notifSettings] ? 'translate-x-5' : ''}`}></div>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end mt-8">
                                <button onClick={handleSave} className="bg-[#1A1A1A] text-white px-6 py-2 rounded text-sm font-medium flex items-center gap-2 hover:bg-[#2C3E50] transition-colors">
                                    <Save size={16} /> Enregistrer préférences
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'REGION':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white border border-[#E8E8E8] rounded-lg p-8">
                            <h3 className="font-oswald text-lg text-[#1A1A1A] mb-6 border-b border-[#F5F5F5] pb-4 flex items-center gap-2">
                                <Globe size={18} /> Région & Langue
                            </h3>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-[11px] uppercase text-[#6B6B6B] font-bold mb-2">Langue du Système</label>
                                    <select
                                        value={regionSettings.language}
                                        onChange={(e) => setRegionSettings({ ...regionSettings, language: e.target.value })}
                                        className="w-full bg-[#FAFAF8] border border-[#E0E0E0] rounded p-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                                    >
                                        <option value="fr">Français (Suisse)</option>
                                        <option value="de">Deutsch (Schweiz)</option>
                                        <option value="it">Italiano (Svizzera)</option>
                                        <option value="en">English (International)</option>
                                    </select>
                                    <p className="text-[10px] text-[#6B6B6B] mt-1">Cette option modifie la langue de l'interface d'administration uniquement.</p>
                                </div>

                                <div>
                                    <label className="block text-[11px] uppercase text-[#6B6B6B] font-bold mb-2">Fuseau Horaire</label>
                                    <select
                                        value={regionSettings.timezone}
                                        onChange={(e) => setRegionSettings({ ...regionSettings, timezone: e.target.value })}
                                        className="w-full bg-[#FAFAF8] border border-[#E0E0E0] rounded p-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                                    >
                                        <option value="Europe/Zurich">Europe/Zurich (GMT+1)</option>
                                        <option value="Europe/London">Europe/London (GMT+0)</option>
                                        <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] uppercase text-[#6B6B6B] font-bold mb-2">Format de Date</label>
                                        <select
                                            value={regionSettings.dateFormat}
                                            onChange={(e) => setRegionSettings({ ...regionSettings, dateFormat: e.target.value })}
                                            className="w-full bg-[#FAFAF8] border border-[#E0E0E0] rounded p-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                                        >
                                            <option value="DD.MM.YYYY">DD.MM.YYYY (31.12.2025)</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
                                            <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] uppercase text-[#6B6B6B] font-bold mb-2">Devise par défaut</label>
                                        <input type="text" value="CHF (Franc Suisse)" disabled className="w-full bg-[#F5F5F5] border border-[#E0E0E0] rounded p-2.5 text-sm text-[#999] cursor-not-allowed" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-8">
                                <button onClick={handleSave} className="bg-[#1A1A1A] text-white px-6 py-2 rounded text-sm font-medium flex items-center gap-2 hover:bg-[#2C3E50] transition-colors">
                                    <Save size={16} /> Appliquer changements
                                </button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    // Sidebar Button Component
    const SettingsTabBtn = ({ id, label, icon: Icon }: { id: SettingsTab, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full text-left px-4 py-3 rounded font-medium text-sm flex items-center gap-3 transition-all duration-200
            ${activeTab === id
                    ? 'bg-[#1A1A1A] text-white shadow-md'
                    : 'bg-white text-gray-500 hover:bg-[#FAFAF8] hover:text-[#1A1A1A] border border-transparent hover:border-[#E8E8E8]'}
        `}
        >
            <Icon size={16} className={activeTab === id ? 'text-[#C0A76A]' : ''} />
            {label}
        </button>
    );

    return (
        <div className="max-w-4xl">
            <h2 className="font-oswald text-2xl text-[#1A1A1A] mb-8 uppercase tracking-wide">Configuration Système</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Sidebar Tabs */}
                <div className="space-y-2">
                    <SettingsTabBtn id="PROFILE" label="Profil Administrateur" icon={User} />
                    <SettingsTabBtn id="SECURITY" label="Sécurité & Accès" icon={Shield} />
                    <SettingsTabBtn id="NOTIFICATIONS" label="Notifications" icon={Bell} />
                    <SettingsTabBtn id="REGION" label="Région & Langue" icon={Globe} />
                </div>

                {/* Content Area */}
                <div className="md:col-span-2">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;