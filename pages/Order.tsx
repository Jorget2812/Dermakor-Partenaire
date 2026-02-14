import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PRODUCTS, PRODUCT_CATEGORIES, MOCK_USER } from '../constants';
import { calculateUserPrice, calculatePremiumSavings } from '../utils/pricing';
import { Product, UserTier } from '../types';
import { CheckCircle2, ChevronRight, AlertCircle, Info } from 'lucide-react';

const Order: React.FC = () => {
  const { t } = useLanguage();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous les produits");
  
  // In a real app, get this from auth context. Using Mock for now.
  const userTier = MOCK_USER.tier; 

  const handleQuantityChange = (productId: string, value: string) => {
    const qty = parseInt(value);
    if (isNaN(qty) || qty < 0) {
        const newQuantities = { ...quantities };
        delete newQuantities[productId];
        setQuantities(newQuantities);
    } else {
        setQuantities({ ...quantities, [productId]: qty });
    }
  };

  const calculateTotal = () => {
    return Object.entries(quantities).reduce((total: number, [id, qty]) => {
      const product = PRODUCTS.find(p => p.id === id);
      if (!product) return total;
      
      const price = calculateUserPrice(product, userTier);
      return total + (price * (qty as number));
    }, 0);
  };

  const handleSubmit = () => {
    if (calculateTotal() > 0) {
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setQuantities({});
        }, 3000);
    }
  };

  const total = calculateTotal();

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Tous les produits") {
        return PRODUCTS;
    }
    return PRODUCTS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h2 className="font-serif text-3xl text-derma-black">{t('order_title')}</h2>
            <p className="text-gray-500 font-light mt-1 text-sm">{t('order_subtitle')}</p>
        </div>
        
        {/* Tier Info Badge */}
        <div className={`px-4 py-2 rounded-md text-sm font-medium border flex items-center gap-2
            ${userTier === UserTier.PREMIUM 
                ? 'bg-[#C0A76A]/10 border-[#C0A76A]/30 text-[#C0A76A]' 
                : 'bg-gray-100 border-gray-200 text-gray-600'}
        `}>
            <Info size={16} />
            {userTier === UserTier.PREMIUM ? 'Tarifs Premium Appliqués ⭐' : 'Tarifs Standard'}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Category Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0 bg-white border border-gray-200 shadow-sm sticky top-4">
            <div className="p-4 border-b border-gray-100">
                <h3 className="text-xs uppercase tracking-widest text-gray-400 font-medium">Catégories</h3>
            </div>
            <nav className="flex flex-col py-2">
                {PRODUCT_CATEGORIES.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`text-left px-5 py-3 text-sm transition-all flex items-center justify-between group
                            ${selectedCategory === category 
                                ? 'text-derma-black font-semibold bg-gray-50 border-l-2 border-derma-gold' 
                                : 'text-gray-500 hover:text-derma-black hover:bg-gray-50 border-l-2 border-transparent'}
                        `}
                    >
                        {category}
                        {selectedCategory === category && <ChevronRight size={14} className="text-derma-gold" />}
                    </button>
                ))}
            </nav>
        </aside>

        {/* Product Table (Excel-like) */}
        <div className="flex-1 w-full bg-white shadow-sm border border-gray-200 rounded-sm overflow-hidden min-h-[400px]">
            {filteredProducts.length > 0 ? (
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                            <th className="px-6 py-3 w-1/3">{t('order_col_product')}</th>
                            <th className="px-6 py-3 hidden md:table-cell">{t('dash_status')}</th>
                            <th className="px-6 py-3 text-right">{t('order_col_price')}</th>
                            <th className="px-6 py-3 w-32 text-center">{t('order_col_qty')}</th>
                            <th className="px-6 py-3 text-right bg-gray-100/50">{t('order_col_total')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((product) => {
                            const userPrice = calculateUserPrice(product, userTier);
                            const lineTotal = (quantities[product.id] || 0) * userPrice;
                            const isRowActive = (quantities[product.id] || 0) > 0;
                            const savings = calculatePremiumSavings(product);

                            return (
                                <tr key={product.id} className={`transition-colors duration-150 ${isRowActive ? 'bg-green-50/30' : 'hover:bg-gray-50'}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-derma-black text-sm">{product.name}</span>
                                            <span className="text-xs text-gray-400 font-mono mt-0.5">{product.sku}</span>
                                            <span className="text-[10px] text-gray-400 mt-1 italic">{product.description}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        {product.stockStatus === 'IN_STOCK' && <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded">Available</span>}
                                        {product.stockStatus === 'LOW_STOCK' && <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Low Stock</span>}
                                        {product.stockStatus === 'OUT_OF_STOCK' && <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded">Out of Stock</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-mono text-sm text-gray-700 font-medium">{userPrice.toFixed(2)}</span>
                                            {/* Show savings for Premium Users */}
                                            {userTier === UserTier.PREMIUM && savings > 0 && (
                                                <span className="text-[10px] text-[#C0A76A] font-medium bg-[#C0A76A]/10 px-1.5 py-0.5 rounded mt-1">
                                                    -{((savings / (userPrice + savings)) * 100).toFixed(0)}%
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="number" 
                                            min="0"
                                            disabled={product.stockStatus === 'OUT_OF_STOCK'}
                                            value={quantities[product.id] || ''}
                                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                            placeholder="0"
                                            className={`w-full text-center border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-derma-gold transition-all
                                                ${isRowActive ? 'border-derma-gold bg-white font-bold' : 'border-gray-200 bg-gray-50'}
                                                ${product.stockStatus === 'OUT_OF_STOCK' ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                        />
                                    </td>
                                    <td className={`px-6 py-4 text-right font-mono text-sm ${isRowActive ? 'font-bold text-derma-black' : 'text-gray-400'} bg-gray-50/30`}>
                                        {lineTotal > 0 ? lineTotal.toFixed(2) : '-'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <p className="text-sm font-light">Aucun produit trouvé dans cette catégorie.</p>
                </div>
            )}
        </div>
      </div>

      {/* Sticky Footer for Totals */}
      <div className="fixed bottom-0 right-0 w-full md:w-[calc(100%-18rem)] bg-white border-t border-derma-gold shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-6 z-20">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400">{t('order_summary')}</span>
                    <div className="text-sm text-gray-500 mt-1">
                        {Object.keys(quantities).length} items selected
                    </div>
                </div>
                
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <span className="block text-xs text-gray-400">Total (CHF)</span>
                        <span className="block font-serif text-2xl text-derma-black font-medium">CHF {total.toFixed(2)}</span>
                    </div>
                    
                    <button 
                        onClick={handleSubmit}
                        disabled={total === 0 || submitted}
                        className={`px-8 py-3 text-xs uppercase tracking-widest transition-all shadow-md flex items-center gap-2
                            ${submitted 
                                ? 'bg-green-600 text-white cursor-default' 
                                : 'bg-derma-black text-white hover:bg-derma-gold'}
                            ${total === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {submitted ? (
                            <>
                                <CheckCircle2 size={16} /> Order Sent
                            </>
                        ) : (
                            t('order_submit')
                        )}
                    </button>
                </div>
          </div>
      </div>
    </div>
  );
};

export default Order;