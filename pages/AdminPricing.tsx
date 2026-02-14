import React, { useState } from 'react';
import { Product, ProductPricing, UserTier } from '../types';
import { PRODUCTS } from '../constants';
import { calculateUserPrice, getDefaultPricing } from '../utils/pricing';
import ProductPricingModal from '../components/ProductPricingModal';
import { Search, Edit2, AlertTriangle, CheckCircle2 } from 'lucide-react';

const AdminPricing: React.FC = () => {
  // Local state to simulate database
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Global Config State
  const [globalStd, setGlobalStd] = useState<string>('0');
  const [globalPrem, setGlobalPrem] = useState<string>('10');
  const [showGlobalConfirm, setShowGlobalConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApplyGlobal = () => {
    const stdVal = parseFloat(globalStd) || 0;
    const premVal = parseFloat(globalPrem) || 0;

    if (stdVal < 0 || stdVal > 100 || premVal < 0 || premVal > 100 || premVal < stdVal) {
      alert("Valeurs invalides. Vérifiez que Premium > Standard et 0-100%.");
      return;
    }

    const updatedProducts = products.map(p => ({
      ...p,
      pricing: {
        basePrice: p.pricing?.basePrice || p.price,
        standard: { type: 'PERCENTAGE', value: stdVal },
        premium: { type: 'PERCENTAGE', value: premVal }
      } as ProductPricing
    }));

    setProducts(updatedProducts);
    setShowGlobalConfirm(false);
    setSuccessMsg(`Remises globales appliquées à ${updatedProducts.length} produits.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleProductSave = (productId: string, newPricing: ProductPricing) => {
    setProducts(products.map(p => p.id === productId ? { ...p, pricing: newPricing } : p));
    setSuccessMsg("Prix mis à jour avec succès.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Notification */}
      {successMsg && (
        <div className="fixed top-20 right-8 bg-[#1A1A1A] text-white px-6 py-4 rounded shadow-xl flex items-center gap-3 animate-fade-in z-50">
           <CheckCircle2 className="text-[#10B981]" />
           {successMsg}
        </div>
      )}

      {/* GLOBAL CONFIGURATION CARD */}
      <div className="bg-white border border-[#E8E8E8] rounded-lg p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
            <h2 className="font-oswald text-xl text-[#1A1A1A] uppercase tracking-wide">Configuration Globale</h2>
            <span className="bg-[#F59E0B]/10 text-[#F59E0B] text-[10px] font-bold px-2 py-0.5 rounded border border-[#F59E0B]/20 uppercase">Admin Only</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-end">
            <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] mb-2">Tier Standard (%)</label>
                <input 
                    type="number" 
                    value={globalStd}
                    onChange={(e) => setGlobalStd(e.target.value)}
                    className="w-full h-12 text-center text-xl font-mono border-2 border-[#E0E0E0] rounded focus:border-[#2C3E50] focus:outline-none"
                    placeholder="0"
                />
            </div>
            <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#C0A76A] mb-2">Tier Premium (%)</label>
                <input 
                    type="number" 
                    value={globalPrem}
                    onChange={(e) => setGlobalPrem(e.target.value)}
                    className="w-full h-12 text-center text-xl font-mono border-2 border-[#E0E0E0] rounded focus:border-[#C0A76A] focus:outline-none"
                    placeholder="10"
                />
            </div>
            <div>
                <button 
                    onClick={() => setShowGlobalConfirm(true)}
                    className="w-full h-12 bg-[#1A1A1A] text-white font-medium uppercase tracking-wide rounded hover:bg-[#2C3E50] transition-all shadow-md active:transform active:scale-95"
                >
                    Appliquer à tout
                </button>
            </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2 text-xs text-[#6B6B6B]">
            <AlertTriangle size={14} className="text-[#F59E0B]" />
            Attention: Cette action écrasera toutes les configurations de prix individuelles.
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showGlobalConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/80 backdrop-blur-sm p-4">
              <div className="bg-white p-8 rounded-lg max-w-md w-full shadow-2xl animate-scale-in">
                  <h3 className="font-oswald text-xl mb-4 text-[#1A1A1A]">Confirmer l'application globale ?</h3>
                  <p className="text-sm text-gray-600 mb-6">
                      Vous allez appliquer une remise de <strong>{globalStd}%</strong> (Standard) et <strong>{globalPrem}%</strong> (Premium) à <strong>{products.length} produits</strong>.
                      <br/><br/>
                      Les prix individuels seront perdus.
                  </p>
                  <div className="flex justify-end gap-3">
                      <button onClick={() => setShowGlobalConfirm(false)} className="px-4 py-2 border rounded text-sm hover:bg-gray-50">Annuler</button>
                      <button onClick={handleApplyGlobal} className="px-4 py-2 bg-[#1A1A1A] text-white rounded text-sm hover:bg-[#2C3E50]">Confirmer</button>
                  </div>
              </div>
          </div>
      )}

      {/* INDIVIDUAL PRICING TABLE */}
      <div className="bg-white border border-[#E8E8E8] rounded-lg overflow-hidden">
         <div className="p-6 border-b border-[#E8E8E8] flex justify-between items-center">
             <h3 className="font-oswald text-lg text-[#1A1A1A]">Gestion des Prix par Produit</h3>
             <div className="relative">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input 
                    type="text" 
                    placeholder="Rechercher produit..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-[#FAFAF8] border border-[#E0E0E0] rounded text-sm w-64 focus:outline-none focus:border-[#1A1A1A]"
                 />
             </div>
         </div>

         <div className="overflow-x-auto">
             <table className="w-full text-left">
                 <thead className="bg-[#FAFAF8] border-b border-[#E8E8E8] text-[10px] uppercase tracking-wider text-[#6B6B6B] font-semibold">
                     <tr>
                         <th className="px-6 py-4">Produit</th>
                         <th className="px-6 py-4 text-right">Prix Base</th>
                         <th className="px-6 py-4 text-right text-[#2C3E50]">Standard</th>
                         <th className="px-6 py-4 text-right text-[#C0A76A]">Premium ⭐</th>
                         <th className="px-6 py-4 text-right">Action</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-[#F5F5F5]">
                     {filteredProducts.map(product => {
                         // Fallback pricing if not set
                         const pricing = product.pricing || getDefaultPricing(product.price);
                         const stdPrice = calculateUserPrice({...product, pricing}, UserTier.STANDARD);
                         const premPrice = calculateUserPrice({...product, pricing}, UserTier.PREMIUM);

                         return (
                             <tr key={product.id} className="hover:bg-[#FAFAF8] transition-colors group">
                                 <td className="px-6 py-4">
                                     <div className="font-medium text-[#1A1A1A] text-sm">{product.name}</div>
                                     <div className="text-xs text-gray-400 font-mono">{product.sku}</div>
                                 </td>
                                 <td className="px-6 py-4 text-right font-mono text-sm text-gray-400">
                                     CHF {pricing.basePrice.toFixed(2)}
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                     <div className="font-medium text-[#1A1A1A]">CHF {stdPrice.toFixed(2)}</div>
                                     <div className="text-[10px] text-gray-400">
                                        {pricing.standard.type === 'PERCENTAGE' ? `-${pricing.standard.value}%` : 'Fixe'}
                                     </div>
                                 </td>
                                 <td className="px-6 py-4 text-right bg-[#C0A76A]/5">
                                     <div className="font-bold text-[#1A1A1A]">CHF {premPrice.toFixed(2)}</div>
                                     <div className="text-[10px] text-[#C0A76A] font-bold">
                                        {pricing.premium.type === 'PERCENTAGE' ? `-${pricing.premium.value}%` : 'Fixe'}
                                     </div>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                     <button 
                                        onClick={() => setEditingProduct({...product, pricing})}
                                        className="p-2 border border-[#E0E0E0] rounded bg-white hover:border-[#1A1A1A] hover:text-[#1A1A1A] text-gray-400 transition-colors"
                                     >
                                         <Edit2 size={14} />
                                     </button>
                                 </td>
                             </tr>
                         );
                     })}
                 </tbody>
             </table>
         </div>
         <div className="p-4 border-t border-[#E8E8E8] text-xs text-gray-400 text-center">
             Affichage de {filteredProducts.length} produits
         </div>
      </div>

      {/* EDIT MODAL */}
      {editingProduct && (
          <ProductPricingModal 
            product={editingProduct} 
            onClose={() => setEditingProduct(null)} 
            onSave={handleProductSave} 
          />
      )}

    </div>
  );
};

export default AdminPricing;