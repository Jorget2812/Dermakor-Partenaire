import React from 'react';
import { X, Lock, Shield } from 'lucide-react';

interface ContentViewerProps {
    url: string;
    type: string;
    title: string;
    onClose: () => void;
}

const ContentViewer: React.FC<ContentViewerProps> = ({ url, type, title, onClose }) => {
    const processUrl = (originalUrl: string) => {
        if (!originalUrl) return '';

        // Detectar Google Drive
        if (originalUrl.includes('drive.google.com')) {
            // Convertir /view o /edit a /preview para evitar la interfaz de Drive y bloqueos de auth si el link es público
            let processed = originalUrl.replace(/\/view(\?.*)?$/, '/preview');
            processed = processed.replace(/\/edit(\?.*)?$/, '/preview');
            // Si no termina en /preview, forzarlo si detectamos el ID de archivo
            if (!processed.endsWith('/preview') && processed.includes('/d/')) {
                const parts = processed.split('/preview')[0].split('?')[0];
                if (parts.endsWith('/')) {
                    processed = parts + 'preview';
                } else if (!parts.endsWith('/preview')) {
                    processed = parts.replace(/\/$/, '') + '/preview';
                }
            }
            return processed;
        }

        // Si es un PDF directo (no Drive)
        if (type === 'PDF' && !originalUrl.includes('drive.google.com')) {
            return `${originalUrl}#toolbar=0&navpanes=0&scrollbar=0`;
        }

        return originalUrl;
    };

    const processedUrl = processUrl(url);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-derma-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="absolute top-6 left-8 flex items-center gap-3">
                <div className="p-2 bg-derma-gold/20 rounded-full text-derma-gold">
                    <Shield size={20} />
                </div>
                <div>
                    <h3 className="text-white font-serif text-xl uppercase tracking-tight">{title}</h3>
                    <p className="text-derma-gold/60 text-[10px] uppercase tracking-[2px] font-bold">Mode Lecture Sécurisée</p>
                </div>
            </div>

            <button
                onClick={onClose}
                className="absolute top-6 right-8 text-white/50 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
            >
                Fermer <X size={24} />
            </button>

            <div className="w-full h-full max-w-6xl max-h-[85vh] mt-20 relative bg-black rounded-lg overflow-hidden shadow-2xl border border-white/10">
                {type === 'VIDEO' ? (
                    <iframe
                        src={url}
                        className="w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        onContextMenu={(e) => e.preventDefault()}
                    ></iframe>
                ) : (
                    <div className="w-full h-full relative group">
                        <iframe
                            src={processedUrl}
                            className="w-full h-full"
                            style={{ pointerEvents: 'auto' }}
                            onContextMenu={(e) => e.preventDefault()}
                        ></iframe>

                        {/* Escudo de seguridad para bloquear el botón de "Open in new window" de Google Drive */}
                        <div className="absolute top-0 right-0 w-32 h-16 bg-transparent z-50 cursor-default" title="Lecture Sécurisée - Dermakor Academy"></div>

                        {/* Overlay superior general para dificultar interacciones no deseadas */}
                        <div className="absolute inset-x-0 top-0 h-10 bg-transparent z-40 pointer-events-none"></div>
                    </div>
                )}
            </div>

            <div className="absolute bottom-6 left-0 right-0 text-center">
                <p className="text-white/30 text-[9px] uppercase tracking-[3px] font-light italic">
                    Propriété exclusive de Dermakor Swiss · Reproduction Interdite
                </p>
            </div>
        </div>
    );
};

export default ContentViewer;
