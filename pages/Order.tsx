import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PRODUCT_CATEGORIES } from '../constants';
import { calculateUserPrice } from '../utils/pricing';
import { Product, UserTier } from '../types';
import { CheckCircle2, ChevronRight, AlertCircle, Info, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Order: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>("Tous les produits");

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('category');

            if (error) throw error;
            setProducts(data.map(p => ({
                id: p.id,
                name: p.name,
                sku: p.sku,
                category: p.category,
                price: Number(p.price),
                stockStatus: p.stock_status as any,
                description: p.description || '',
                pricing: {
                    basePrice: Number(p.price),
                    standard: { type: 'PERCENTAGE', value: 0 },
                    premium: { type: 'PERCENTAGE', value: 10 }
                }
            })));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const userTier = user?.tier || UserTier.STANDARD;

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
            const product = products.find(p => p.id === id);
            if (!product) return total;
            const price = calculateUserPrice(product, userTier);
            return total + (price * (qty as number));
        }, 0);
    };

    const handleSubmit = async () => {
        if (!user) return;
        const totalAmount = calculateTotal();
        if (totalAmount <= 0) return;

        setIsSubmitting(true);
        try {
            const orderItems = Object.entries(quantities).map(([id, qty]) => {
                const product = products.find(p => p.id === id);
                return {
                    id,
                    sku: product?.sku,
                    name: product?.name,
                    quantity: qty,
                    price: calculateUserPrice(product!, userTier)
                };
            });

            const { error } = await supabase
                .from('orders')
                .insert([{
                    partner_id: user.id,
                    total_amount: totalAmount,
                    items: orderItems,
                    status: 'PREPARATION'
                }]);

            if (error) throw error;

            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setQuantities({});
                navigate('/dashboard');
            }, 3000);
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la validation de la commande');
        } finally {
            setIsSubmitting(false);
        }
    };

    const total = calculateTotal();

    const filteredProducts = useMemo(() => {
        if (selectedCategory === "Tous les produits") {
            return products;
        }
        return products.filter(p => p.category === selectedCategory);
    }, [selectedCategory, products]);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 size={32} className="animate-spin text-derma-gold" />
            </div>
        );
    }

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="font-serif text-3xl text-derma-black">{t('order_title')}</h2>
                    <p className="text-gray-500 font-light mt-1 text-sm">{t('order_subtitle')}</p>
                </div>
                <div className={`px-4 py-2 rounded-md text-sm font-medium border flex items-center gap-2
                    ${userTier === UserTier.PREMIUM ? 'bg-[#C0A76A]/10 border-[#C0A76A]/30 text-[#C0A76A]' : 'bg-gray-100 border-gray-200 text-gray-600'}
                `}>
                    <Info size={16} />
                    {userTier === UserTier.PREMIUM ? 'Tarifs Premium Appliqués ⭐' : 'Tarifs Standard'}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <aside className="w-full lg:w-64 flex-shrink-0 bg-white border border-gray-200 shadow-sm sticky top-4">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="text-xs uppercase tracking-widest text-gray-400 font-medium">Catégories</h3>
                    </div>
                    <nav className="flex flex-col py-2">
                        {["Tous les produits", ...PRODUCT_CATEGORIES.filter(c => c !== "Tous les productos")].map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`text-left px-5 py-3 text-sm transition-all flex items-center justify-between group
                                    ${selectedCategory === category ? 'text-derma-black font-semibold bg-gray-50 border-l-2 border-derma-gold' : 'text-gray-500 hover:text-derma-black hover:bg-gray-50 border-l-2 border-transparent'}
                                `}
                            >
                                {category}
                                {selectedCategory === category && <ChevronRight size={14} className="text-derma-gold" />}
                            </button>
                        ))}
                    </nav>
                </aside>

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

                                    return (
                                        <tr key={product.id} className={`transition-colors duration-150 ${isRowActive ? 'bg-green-50/30' : 'hover:bg-gray-50'}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-derma-black text-sm">{product.name}</span>
                                                    <span className="text-xs text-gray-400 font-mono mt-0.5">{product.sku}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                {product.stockStatus === 'IN_STOCK' && <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded">Available</span>}
                                                {product.stockStatus === 'LOW_STOCK' && <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Low Stock</span>}
                                                {product.stockStatus === 'OUT_OF_STOCK' && <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded">Out of Stock</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-mono text-sm text-gray-700 font-medium">{userPrice.toFixed(2)}</span>
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
                            <p className="text-sm font-light">Aucun produit trouvé.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="fixed bottom-0 right-0 w-full md:w-[calc(100%-18rem)] bg-white border-t border-derma-gold shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-6 z-20">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400">{t('order_summary')}</span>
                        <div className="text-sm text-gray-500 mt-1">{Object.keys(quantities).length} items selected</div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <span className="block text-xs text-gray-400">Total (CHF)</span>
                            <span className="block font-serif text-2xl text-derma-black font-medium">CHF {total.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={total === 0 || submitted || isSubmitting}
                            className={`px-8 py-3 text-xs uppercase tracking-widest transition-all shadow-md flex items-center gap-2
                                ${submitted ? 'bg-green-600 text-white cursor-default' : 'bg-derma-black text-white hover:bg-derma-gold'}
                                ${total === 0 || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : submitted ? <><CheckCircle2 size={16} /> Sent</> : t('order_submit')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Order;