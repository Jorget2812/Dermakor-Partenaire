import React from 'react';
import { Lock, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface PremiumFeatureWrapperProps {
    isPremium: boolean;
    children: React.ReactNode;
    title?: string;
    description?: string;
    className?: string; // Allow custom classes
}

const PremiumFeatureWrapper: React.FC<PremiumFeatureWrapperProps> = ({ isPremium, children, title, description, className = '' }) => {
    return (
        <div className={`relative ${className} group overflow-hidden rounded-sm border transition-all duration-500 ${!isPremium ? 'border-derma-border bg-gray-50/50' : 'border-derma-gold/30 bg-white hover:border-derma-gold hover:shadow-premium'}`}>

            {/* Content Container */}
            <motion.div
                className={`transition-all duration-700 ease-out ${!isPremium ? 'blur-[5px] opacity-40 pointer-events-none select-none grayscale-[0.6] scale-[0.98]' : ''}`}
                whileHover={!isPremium ? { scale: 0.99, filter: "blur(4px) grayscale(0.4)" } : {}}
            >
                {children}
            </motion.div>

            {/* Lock Overlay for Standard Users */}
            {!isPremium && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/10 backdrop-blur-[1px]">
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="bg-white/95 p-8 rounded-sm shadow-2xl border border-derma-gold/30 flex flex-col items-center text-center max-w-[300px] relative overflow-hidden group/card"
                    >
                        {/* Shimmer effect on card background */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="w-14 h-14 bg-derma-black rounded-full flex items-center justify-center mb-5 relative shadow-lg">
                            <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Lock size={22} className="text-white" />
                            </motion.div>

                            {/* Pulsing rings */}
                            <motion.div
                                className="absolute inset-0 rounded-full border border-derma-gold/50"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />

                            <div className="absolute -top-1 -right-1 bg-derma-gold rounded-full p-1.5 border-2 border-white shadow-sm z-10">
                                <Crown size={12} className="text-derma-black" />
                            </div>
                        </div>

                        <h4 className="font-oswald text-xl text-derma-black uppercase tracking-tight mb-2">
                            Disponible en Premium
                        </h4>

                        {description && (
                            <p className="text-[11px] text-gray-500 mb-6 leading-relaxed font-light">
                                {description}
                            </p>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative px-6 py-3 bg-derma-gold text-derma-black text-[10px] font-bold uppercase tracking-[0.2em] rounded hover:bg-white border border-transparent hover:border-derma-gold transition-all w-full overflow-hidden group/btn"
                        >
                            <span className="relative z-10">Débloquer</span>

                            {/* Button Shimmer */}
                            <motion.div
                                className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out"
                            />
                        </motion.button>
                    </motion.div>
                </div>
            )}

            {/* Premium Badge for Unlocked Users */}
            {isPremium && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-derma-gold/10 rounded-full text-[9px] font-bold text-derma-gold uppercase tracking-widest border border-derma-gold/20 backdrop-blur-sm shadow-sm">
                        <Crown size={10} fill="currentColor" />
                        <span>Premium Active</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PremiumFeatureWrapper;
