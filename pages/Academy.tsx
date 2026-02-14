import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ACADEMY_CONTENT } from '../constants';
import { User, UserTier } from '../types';
import { Lock, FileText, PlayCircle, Award, ArrowRight } from 'lucide-react';

interface AcademyProps {
  user: User;
}

const Academy: React.FC<AcademyProps> = ({ user }) => {
  const { t } = useLanguage();

  const getIcon = (type: string) => {
    switch (type) {
        case 'VIDEO': return <PlayCircle size={20} />;
        case 'PDF': return <FileText size={20} />;
        case 'CERTIFICATION': return <Award size={20} />;
        default: return <FileText size={20} />;
    }
  };

  return (
    <div className="space-y-8">
       {/* Header */}
       <div className="border-b border-gray-200 pb-6">
        <h2 className="font-serif text-3xl text-derma-black">{t('academy_title')}</h2>
        <p className="text-gray-500 font-light mt-1 text-sm">{t('academy_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ACADEMY_CONTENT.map((resource) => {
            const isLocked = resource.tierReq === UserTier.PREMIUM && user.tier === UserTier.STANDARD;

            return (
                <div key={resource.id} className="group bg-white border border-gray-200 hover:border-derma-gold transition-colors duration-300 relative">
                    {/* Thumbnail Area */}
                    <div className="h-48 bg-gray-100 overflow-hidden relative">
                        <img 
                            src={resource.thumbnail} 
                            alt={resource.title} 
                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'blur-[2px] grayscale' : 'grayscale group-hover:grayscale-0'}`} 
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 text-derma-black">
                             {getIcon(resource.type)} {resource.type}
                        </div>
                        
                        {isLocked && (
                            <div className="absolute inset-0 bg-derma-black/60 flex flex-col items-center justify-center text-white">
                                <Lock size={24} className="mb-2" />
                                <span className="text-xs uppercase tracking-widest font-medium">{t('academy_locked')}</span>
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="p-6">
                        <h3 className="font-serif text-lg text-derma-black mb-2 leading-tight group-hover:text-derma-gold transition-colors">
                            {resource.title}
                        </h3>
                        <div className="flex items-center justify-between mt-6">
                            <span className="text-xs text-gray-400 font-mono">{resource.duration}</span>
                            
                            {!isLocked ? (
                                <button className="text-xs uppercase tracking-widest text-derma-black flex items-center gap-2 group-hover:gap-3 transition-all">
                                    {t('academy_view')} <ArrowRight size={14} />
                                </button>
                            ) : (
                                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Upgrade Required</span>
                            )}
                        </div>
                    </div>
                </div>
            )
        })}
      </div>

      {/* Upsell Banner (Only visible if Standard) */}
      {user.tier === UserTier.STANDARD && (
          <div className="bg-derma-charcoal text-derma-goldLight p-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-6 border border-derma-gold/20">
              <div className="max-w-xl">
                  <h4 className="font-serif text-2xl mb-2 text-white">Unlock Professional Excellence</h4>
                  <p className="text-sm font-light text-gray-300 leading-relaxed">
                      Upgrade to Premium Partner status by reaching CHF 3,000 yearly volume to access advanced video protocols and certification exams.
                  </p>
              </div>
              <div className="flex-shrink-0 text-center border-l border-white/10 pl-8">
                  <span className="block text-3xl font-serif text-white mb-1">850 CHF</span>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400">Remaining to unlock</span>
              </div>
          </div>
      )}
    </div>
  );
};

export default Academy;