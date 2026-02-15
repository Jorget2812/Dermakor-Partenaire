import React from 'react';
import { Award, ShieldCheck, Calendar, MapPin } from 'lucide-react';

interface CertificateTemplateProps {
    partnerName: string;
    instituteName: string;
    levelName: string;
    issueDate: string;
    certificateCode: string;
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
    partnerName,
    instituteName,
    levelName,
    issueDate,
    certificateCode
}) => {
    return (
        <div id="certificate-capture" className="w-[1123px] h-[794px] bg-white p-12 relative overflow-hidden flex flex-col items-center justify-between border-[20px] border-derma-black shadow-2xl mx-auto font-serif">
            {/* Elegant Corner Accents */}
            <div className="absolute top-0 left-0 w-64 h-64 border-t-4 border-l-4 border-derma-gold opacity-30"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 border-b-4 border-r-4 border-derma-gold opacity-30"></div>

            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <Award size={600} />
            </div>

            {/* Header */}
            <div className="text-center z-10 space-y-4">
                <span className="text-xs font-bold uppercase tracking-[6px] text-derma-gold">Swiss Scientific Excellence</span>
                <h1 className="text-7xl font-serif text-derma-black uppercase tracking-tight">Certification Officielle</h1>
                <div className="h-1 w-32 bg-derma-gold mx-auto"></div>
            </div>

            {/* Body */}
            <div className="text-center z-10 space-y-10 max-w-4xl">
                <p className="text-xl italic text-derma-text-muted">Par la présente, Dermakor Swiss & KRX Aesthetics certifient que</p>

                <div className="space-y-2">
                    <h2 className="text-5xl text-derma-black uppercase tracking-wide border-b border-derma-border pb-4">{instituteName}</h2>
                    <p className="text-lg text-derma-gold font-bold tracking-widest uppercase">Représenté par {partnerName}</p>
                </div>

                <p className="text-lg leading-relaxed text-derma-text-muted px-12">
                    A complété avec succès le programme de formation stratégique et clinique du niveau
                    <br />
                    <span className="text-3xl font-bold text-derma-black uppercase tracking-tighter mt-4 block">
                        Dermakor Academy: {levelName}
                    </span>
                </p>
            </div>

            {/* Footer */}
            <div className="w-full grid grid-cols-3 items-end z-10 mt-12 pb-8">
                <div className="text-left space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-derma-text-muted uppercase tracking-widest">
                        <Calendar size={12} className="text-derma-gold" />
                        Date d'émission: {issueDate}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-derma-text-muted uppercase tracking-widest">
                        <ShieldCheck size={12} className="text-derma-gold" />
                        ID: {certificateCode}
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 flex items-center justify-center border border-derma-border bg-derma-cream/30 p-2">
                        {/* Placeholder for QR Code */}
                        <div className="w-full h-full bg-derma-black/5 flex items-center justify-center text-[8px] text-center text-derma-text-muted px-2">
                            VERIFICATION SÉCURISÉE
                        </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-derma-black">Sceau d'Authenticité</span>
                </div>

                <div className="text-right space-y-4">
                    <div className="space-y-1">
                        <p className="font-serif italic text-xl">Jorge Torres</p>
                        <div className="h-px w-32 bg-derma-black/20 ml-auto"></div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-derma-gold">Directeur Général - Dermakor Swiss</p>
                    </div>
                </div>
            </div>

            {/* Bottom Slogan */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
                <span className="text-[9px] text-derma-text-muted font-light tracking-[4px] uppercase flex items-center justify-center gap-2">
                    <MapPin size={8} /> Zurich · Switzerland · Global Academy
                </span>
            </div>
        </div>
    );
};

export default CertificateTemplate;
