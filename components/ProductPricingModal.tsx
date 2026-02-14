import React, { useState, useEffect } from 'react';
import { Product, ProductPricing, UserTier } from '../types';
import { calculateUserPrice, getDefaultPricing } from '../utils/pricing';
import { X, Save, AlertTriangle, ArrowRight } from 'lucide-react';

interface ProductPricingModalProps {
  product: Product;
  onSave: (productId: string, pricing: ProductPricing) => void;
  onClose: () => void;
}

const ProductPricingModal: React.FC<ProductPricingModalProps> = ({ product, onSave, onClose }) => {
  const [pricing, setPricing] = useState<ProductPricing>(
    product.pricing || getDefaultPricing(product.price)
  );

  const [stdFinal, setStdFinal] = useState(0);
  const [premFinal, setPremFinal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Live calculation of final prices for preview
  useEffect(() => {
    const tempProduct = { ...product, pricing };
    const std = calculateUserPrice(tempProduct, UserTier.STANDARD);
    const prem = calculateUserPrice(tempProduct, UserTier.PREMIUM);
    setStdFinal(std);
    setPremFinal(prem);

    // Validate
    if (prem > std) {
      setError("Le prix Premium ne peut pas être supérieur au prix Standard.");
    } else if (pricing.basePrice <= 0) {
      setError("Le prix de base doit être supérieur à 0.");
    } else {
      setError(null);
    }
  }, [pricing, product]);

  const handleSave = () => {
    if (!error) {
      onSave(product.id, pricing);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1A1A1A]/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#FAFAF8] px-8 py-6 border-b border-[#E8E8E8] flex justify-between items-start">
            <div>
                <h2 className="font-oswald text-xl text-[#1A1A1A] uppercase tracking-wide">Éditer les prix</h2>
                <p className="font-sans text-sm text-[#6B6B6B] mt-1">{product.name}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-[#1A1A1A]">
                <X size={24} />
            </button>
        </div>

        <div className="p-8 overflow-y-auto">
            
            {/* Base Price */}
            <div className="mb-8">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-2">Prix de Base (CHF)</label>
                <div className="relative max-w-[200px]">
                    <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={pricing.basePrice}
                        onChange={(e) => setPricing({...pricing, basePrice: parseFloat(e.target.value) || 0})}
                        className="w-full bg-white border-2 border-[#E0E0E0] rounded-md p-3 text-lg font-mono text-[#1A1A1A] focus:outline-none focus:border-[#C0A76A]"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-[#F5F5F5]">
                
                {/* Standard Config */}
                <div className="bg-[#FAFAF8] p-5 rounded border border-[#E8E8E8]">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-2 h-2 rounded-full bg-[#2C3E50]"></span>
                        <h3 className="text-sm font-bold text-[#2C3E50] uppercase tracking-wide">Tier Standard</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] uppercase text-[#6B6B6B] mb-1">Méthode</label>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setPricing({...pricing, standard: {...pricing.standard, type: 'PERCENTAGE'}})}
                                    className={`flex-1 py-2 text-xs font-medium rounded border ${pricing.standard.type === 'PERCENTAGE' ? 'bg-[#2C3E50] text-white border-[#2C3E50]' : 'bg-white text-gray-500 border-gray-200'}`}
                                >
                                    % Remise
                                </button>
                                <button 
                                    onClick={() => setPricing({...pricing, standard: {...pricing.standard, type: 'FIXED'}})}
                                    className={`flex-1 py-2 text-xs font-medium rounded border ${pricing.standard.type === 'FIXED' ? 'bg-[#2C3E50] text-white border-[#2C3E50]' : 'bg-white text-gray-500 border-gray-200'}`}
                                >
                                    Prix Fixe
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase text-[#6B6B6B] mb-1">
                                {pricing.standard.type === 'PERCENTAGE' ? 'Valeur (%)' : 'Valeur (CHF)'}
                            </label>
                            <input 
                                type="number" 
                                value={pricing.standard.value}
                                onChange={(e) => setPricing({...pricing, standard: {...pricing.standard, value: parseFloat(e.target.value) || 0}})}
                                className="w-full border border-[#E0E0E0] rounded p-2 text-sm font-mono focus:border-[#2C3E50] focus:outline-none"
                            />
                        </div>

                        <div className="pt-2 border-t border-gray-200 mt-2 flex justify-between items-center">
                            <span className="text-xs text-gray-500">Prix Final:</span>
                            <span className="font-oswald text-lg text-[#1A1A1A]">{stdFinal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Premium Config */}
                <div className="bg-[#FAFAF8] p-5 rounded border border-[#C0A76A]/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#C0A76A]/10 rounded-bl-full -mr-8 -mt-8"></div>
                    
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-2 h-2 rounded-full bg-[#C0A76A]"></span>
                        <h3 className="text-sm font-bold text-[#C0A76A] uppercase tracking-wide">Tier Premium ⭐</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] uppercase text-[#6B6B6B] mb-1">Méthode</label>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setPricing({...pricing, premium: {...pricing.premium, type: 'PERCENTAGE'}})}
                                    className={`flex-1 py-2 text-xs font-medium rounded border ${pricing.premium.type === 'PERCENTAGE' ? 'bg-[#C0A76A] text-white border-[#C0A76A]' : 'bg-white text-gray-500 border-gray-200'}`}
                                >
                                    % Remise
                                </button>
                                <button 
                                    onClick={() => setPricing({...pricing, premium: {...pricing.premium, type: 'FIXED'}})}
                                    className={`flex-1 py-2 text-xs font-medium rounded border ${pricing.premium.type === 'FIXED' ? 'bg-[#C0A76A] text-white border-[#C0A76A]' : 'bg-white text-gray-500 border-gray-200'}`}
                                >
                                    Prix Fixe
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase text-[#6B6B6B] mb-1">
                                {pricing.premium.type === 'PERCENTAGE' ? 'Valeur (%)' : 'Valeur (CHF)'}
                            </label>
                            <input 
                                type="number" 
                                value={pricing.premium.value}
                                onChange={(e) => setPricing({...pricing, premium: {...pricing.premium, value: parseFloat(e.target.value) || 0}})}
                                className="w-full border border-[#E0E0E0] rounded p-2 text-sm font-mono focus:border-[#C0A76A] focus:outline-none"
                            />
                        </div>

                        <div className="pt-2 border-t border-gray-200 mt-2 flex justify-between items-center">
                            <span className="text-xs text-gray-500">Prix Final:</span>
                            <span className="font-oswald text-lg text-[#1A1A1A]">{premFinal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison / Summary */}
            <div className="mt-8">
                <h4 className="text-xs uppercase tracking-widest text-[#6B6B6B] mb-4">Prévisualisation</h4>
                <div className="flex items-center gap-4 text-sm bg-white border border-[#E8E8E8] p-4 rounded-md">
                    <div className="text-gray-400 line-through">CHF {pricing.basePrice.toFixed(2)}</div>
                    <ArrowRight size={16} className="text-gray-300" />
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Standard</span>
                        <span className="font-medium text-[#1A1A1A]">CHF {stdFinal.toFixed(2)}</span>
                    </div>
                    <div className="w-px h-8 bg-gray-200 mx-2"></div>
                    <div className="flex flex-col">
                        <span className="text-xs text-[#C0A76A] font-bold">Premium</span>
                        <span className="font-medium text-[#1A1A1A]">CHF {premFinal.toFixed(2)}</span>
                    </div>
                    
                    {(stdFinal - premFinal) > 0 && (
                        <div className="ml-auto bg-[#10B981]/10 text-[#10B981] px-3 py-1 rounded text-xs font-bold border border-[#10B981]/20">
                            Économie: CHF {(stdFinal - premFinal).toFixed(2)}
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-6 bg-red-50 text-red-600 p-3 rounded text-sm flex items-center gap-2 border border-red-100">
                    <AlertTriangle size={16} /> {error}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="bg-[#FAFAF8] px-8 py-4 border-t border-[#E8E8E8] flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-[#E0E0E0] rounded text-sm font-medium hover:bg-[#F5F5F5] text-[#1A1A1A]">
                Annuler
            </button>
            <button 
                onClick={handleSave}
                disabled={!!error}
                className={`px-6 py-2 bg-[#1A1A1A] text-white rounded text-sm font-medium flex items-center gap-2
                    ${!!error ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2C3E50]'}
                `}
            >
                <Save size={16} /> Enregistrer
            </button>
        </div>

      </div>
    </div>
  );
};

export default ProductPricingModal;