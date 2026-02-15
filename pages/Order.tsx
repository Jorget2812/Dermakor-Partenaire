import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { calculateUserPrice } from '../utils/pricing';
import { Product, UserTier, Category } from '../types';
import {
    CheckCircle2,
    ChevronRight,
    AlertCircle,
    Info,
    Loader2,
    TrendingUp,
    Zap,
    Star,
    Target,
    ArrowUpRight,
    ShoppingCart,
    Percent,
    Calculator,
    Flame,
    MousePointer2
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { STRATEGIC_PACKS } from '../constants';

const Order: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name');

            if (error) throw error;
            setProducts(data.map(p => ({
                id: p.id,
                name: p.name,
                sku: p.sku,
                category: p.category,
                categoryId: p.category_id,
                price: Number(p.price),
                retailPrice: p.retail_price ? Number(p.retail_price) : undefined,
                stockStatus: p.stock_status as any,
                stock_quantity: Number(p.stock_quantity || 0),
                description: p.description || '',
                strategicLabel: p.strategic_label as any,
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
        fetchCategories();
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

    const total = calculateTotal();

    const handleAddPack = (pack: any) => {
        const newQuantities = { ...quantities };
        pack.items.forEach((item: any) => {
            newQuantities[item.productId] = (newQuantities[item.productId] || 0) + item.quantity;
        });
        setQuantities(newQuantities);
    };

    const nextTierGoal = useMemo(() => {
        if (total < 800) return 800;
        if (total < 2000) return 2000;
        if (total < 4000) return 4000;
        return 4000;
    }, [total]);

    const nextTierName = useMemo(() => {
        if (total < 800) return "Premium Base";
        if (total < 2000) return "Premium Pro";
        if (total < 4000) return "Elite 20";
        return "Elite 20 Max";
    }, [total]);

    const progressPercentage = Math.min((total / nextTierGoal) * 100, 100);

    const cartKpis = useMemo(() => {
        let retail = 0;
        let profit = 0;

        Object.entries(quantities).forEach(([id, qty]) => {
            const product = products.find(p => p.id === id);
            if (product && qty > 0) {
                const price = calculateUserPrice(product, userTier);
                const rrp = product.retailPrice || 0; // Eliminado fallback 1.6
                retail += rrp * qty;
                profit += rrp > 0 ? (rrp - price) * qty : 0;
            }
        });

        const margin = retail > 0 ? (profit / retail) * 100 : 0;

        return {
            retail,
            profit,
            margin
        };
    }, [quantities, products, userTier]);

    const filteredProducts = useMemo(() => {
        if (selectedCategory === "ALL") {
            return products;
        }
        return products.filter(p => p.categoryId === selectedCategory || p.category === selectedCategory);
    }, [selectedCategory, products]);

    const handleSubmit = async () => {
        if (!user) return;
        if (total <= 0) return;

        setIsSubmitting(true);
        try {
            const orderItems = Object.entries(quantities).map(([id, qty]) => {
                const product = products.find(p => p.id === id);
                return {
                    productId: id,
                    sku: product?.sku,
                    name: product?.name,
                    quantity: qty,
                    price: calculateUserPrice(product!, userTier),
                    rrp: product?.retailPrice || 0
                };
            });

            const { error } = await supabase
                .from('orders')
                .insert([{
                    partner_id: user.id,
                    total_amount: total,
                    items: orderItems,
                    status: 'PREPARATION',
                    channel: 'Online Store',
                    payment_status: 'Pagado',
                    delivery_status: 'En attente',
                    delivery_method: 'Livraison standard',
                    metadata: {
                        estimatedRetail: cartKpis.retail,
                        potentialProfit: cartKpis.profit,
                        margin: cartKpis.margin,
                        tierAtOrder: userTier
                    }
                }]);

            if (error) throw error;

            setSubmitted(true);

            // Refrescar perfil de usuario para actualizar gasto acumulado si es necesario
            // (La mayoría de las veces el dashboard lo hará al montar)

            setTimeout(() => {
                setQuantities({});
                navigate('/dashboard');
            }, 4000);
        } catch (err: any) {
            console.error('Submit Error:', err);
            alert(`Erreur lors de la validation de la commande: ${err.message || 'Erreur inconnue'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 size={32} className="animate-spin text-derma-gold" />
            </div>
        );
    }

    return (
        <div className="pb-40 bg-[#FAFAF8] min-h-screen px-4 md:px-8">
            {/* STRATEGIC HEADER & TIER PROGRESS */}
            <header className="mb-12 pt-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="h-px w-8 bg-derma-gold"></span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-derma-gold font-bold">DermaKor Pro Engine</span>
                        </div>
                        <h2 className="font-oswald text-4xl text-derma-black uppercase tracking-tight">{t('order_title')}</h2>
                        <p className="text-gray-400 font-light mt-2 max-w-xl leading-relaxed">
                            {t('order_subtitle')}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-white border border-derma-border rounded-sm">
                        <Star className="text-derma-gold" size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest text-derma-black">
                            {userTier.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {/* REAL-TIME TIER PROGRESSION BAR */}
                <div className="bg-white p-8 border border-derma-border rounded-sm shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={120} />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
                        <div>
                            <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">{t('order_tier_advance')}</h3>
                            <div className="flex items-center gap-3">
                                <span className="font-oswald text-2xl text-derma-black uppercase tracking-wider">Objectif : {nextTierName}</span>
                                <span className="px-2 py-0.5 bg-derma-gold/10 text-derma-gold text-[9px] font-bold rounded uppercase tracking-tighter">Niveau Suivant</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Volume Actuel Commande</span>
                            <div className="text-xl font-bold text-derma-black font-mono">CHF {total.toFixed(2)} / {nextTierGoal}</div>
                        </div>
                    </div>

                    <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute top-0 left-0 h-full bg-derma-gold"
                        />
                    </div>

                    <div className="flex justify-between items-center relative z-10">
                        <p className="text-[11px] text-gray-500 italic">
                            {total < nextTierGoal
                                ? `Il vous manque CHF ${(nextTierGoal - total).toFixed(2)} pour débloquer les avantages ${nextTierName}.`
                                : `Félicitations ! Ce panier vous positionne au niveau ${nextTierName}.`
                            }
                        </p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 opacity-40">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                <span className="text-[9px] font-bold uppercase tracking-tighter">Base (800)</span>
                            </div>
                            <div className={`flex items-center gap-1.5 ${total >= 2000 ? 'text-derma-gold font-bold' : 'opacity-40'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${total >= 2000 ? 'bg-derma-gold' : 'bg-gray-300'}`}></div>
                                <span className="text-[9px] uppercase tracking-tighter">Pro (2000)</span>
                            </div>
                            <div className={`flex items-center gap-1.5 ${total >= 4000 ? 'text-derma-gold font-bold' : 'opacity-40'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${total >= 4000 ? 'bg-derma-gold' : 'bg-gray-300'}`}></div>
                                <span className="text-[9px] uppercase tracking-tighter">Elite (4000)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* STRATEGIC PACKS SECTION */}
            <section className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                    <Zap className="text-derma-gold" size={20} />
                    <h3 className="font-oswald text-xl text-derma-black uppercase tracking-widest">{t('order_pack_title')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {STRATEGIC_PACKS.map((pack) => (
                        <motion.div
                            key={pack.id}
                            whileHover={{ y: -5 }}
                            className="bg-white border border-derma-border p-8 rounded-sm shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative group"
                        >
                            <div className="absolute top-4 right-4 text-[9px] font-bold text-derma-gold bg-derma-gold/5 px-2 py-1 rounded tracking-widest border border-derma-gold/10">
                                {pack.badge}
                            </div>
                            <h4 className="font-oswald text-lg text-derma-black mb-3">{pack.name}</h4>
                            <p className="text-xs text-gray-400 mb-8 font-light leading-relaxed flex-1">
                                {pack.description}
                            </p>
                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                                <div className="font-oswald text-xl text-derma-black">CHF {pack.price}</div>
                                <button
                                    onClick={() => handleAddPack(pack)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-derma-black text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-derma-gold transition-colors"
                                >
                                    <MousePointer2 size={12} />
                                    Ajouter
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
                <aside className="w-full lg:w-64 flex-shrink-0 bg-white border border-derma-border shadow-sm sticky top-8 rounded-sm">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Catégories</h3>
                    </div>
                    <nav className="flex flex-col py-2">
                        <button
                            onClick={() => setSelectedCategory("ALL")}
                            className={`text-left px-5 py-3 text-xs uppercase tracking-wider transition-all flex items-center justify-between group
                                ${selectedCategory === "ALL" ? 'text-derma-black font-bold bg-gray-50 border-l-2 border-derma-gold' : 'text-gray-500 hover:text-derma-black hover:bg-gray-50 border-l-2 border-transparent'}
                            `}
                        >
                            {t('catalog_tab_all')}
                            {selectedCategory === "ALL" && <ChevronRight size={14} className="text-derma-gold" />}
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`text-left px-5 py-3 text-xs uppercase tracking-wider transition-all flex items-center justify-between group
                                    ${selectedCategory === cat.id ? 'text-derma-black font-bold bg-gray-50 border-l-2 border-derma-gold' : 'text-gray-500 hover:text-derma-black hover:bg-gray-50 border-l-2 border-transparent'}
                                `}
                            >
                                {cat.name}
                                {selectedCategory === cat.id && <ChevronRight size={14} className="text-derma-gold" />}
                            </button>
                        ))}
                    </nav>
                </aside>

                <div className="flex-1 w-full bg-white shadow-sm border border-derma-border rounded-sm overflow-hidden min-h-[600px]">
                    {filteredProducts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-derma-border text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                                        <th className="px-6 py-4 w-1/3">{t('order_col_product')}</th>
                                        <th className="px-6 py-4 hidden md:table-cell text-center">{t('order_rrp_price')}</th>
                                        <th className="px-6 py-4 text-center">{t('order_col_price')}</th>
                                        <th className="px-6 py-4 text-center">{t('order_unit_profit')}</th>
                                        <th className="px-6 py-4 w-28 text-center">{t('order_col_qty')}</th>
                                        <th className="px-6 py-4 text-right bg-gray-50/30 font-bold">{t('order_col_total')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredProducts.map((product) => {
                                        const userPrice = calculateUserPrice(product, userTier);
                                        const lineTotal = (quantities[product.id] || 0) * userPrice;
                                        const isRowActive = (quantities[product.id] || 0) > 0;
                                        const rrp = product.retailPrice || 0; // Eliminado fallback 1.6
                                        const unitProfit = rrp > 0 ? rrp - userPrice : 0;
                                        const marginPercent = rrp > 0 ? Math.round((unitProfit / rrp) * 100) : 0;

                                        return (
                                            <tr key={product.id} className={`transition-all duration-200 ${isRowActive ? 'bg-derma-gold/[0.03]' : 'hover:bg-gray-50/50'}`}>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-oswald text-derma-black text-sm uppercase tracking-wide">{product.name}</span>
                                                            {product.strategicLabel && (
                                                                <span className="px-1.5 py-0.5 bg-derma-gold/10 text-derma-gold text-[8px] font-bold uppercase rounded border border-derma-gold/10">
                                                                    {product.strategicLabel.replace('_', ' ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 font-mono">{product.sku}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 hidden md:table-cell text-center">
                                                    <span className="text-gray-400 text-xs font-mono">CHF {rrp.toFixed(2)}</span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="font-mono text-sm text-derma-black font-medium">CHF {userPrice.toFixed(2)}</span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-green-600 font-bold text-xs font-mono">+CHF {unitProfit.toFixed(1)}</span>
                                                        <span className="text-[9px] text-green-600/60 font-bold uppercase">{marginPercent}% ROI</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        disabled={product.stockStatus === 'OUT_OF_STOCK'}
                                                        value={quantities[product.id] || ''}
                                                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                                        placeholder="0"
                                                        className={`w-full text-center border p-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-derma-gold transition-all rounded-sm
                                                            ${isRowActive ? 'border-derma-gold bg-white' : 'border-gray-100 bg-gray-50/50'}
                                                            ${product.stockStatus === 'OUT_OF_STOCK' ? 'opacity-30 cursor-not-allowed' : ''}
                                                        `}
                                                    />
                                                </td>
                                                <td className={`px-6 py-5 text-right font-mono text-sm ${isRowActive ? 'font-bold text-derma-black' : 'text-gray-300'} bg-gray-50/20`}>
                                                    {lineTotal > 0 ? `CHF ${lineTotal.toFixed(2)}` : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-gray-300">
                            <ShoppingCart size={48} className="mb-4 opacity-20" />
                            <p className="text-xs uppercase tracking-widest font-bold">{t('common_no_results')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* SUCCESS OVERLAY */}
            <AnimatePresence>
                {submitted && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-derma-black/95 flex items-center justify-center p-4 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white p-12 rounded-sm max-w-lg w-full text-center shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-derma-gold"></div>
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-derma-gold/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={40} className="text-derma-gold" />
                                </div>
                            </div>
                            <h3 className="font-oswald text-3xl text-derma-black uppercase tracking-tight mb-4">COMMANDE VALIDÉE</h3>
                            <p className="text-gray-400 font-light mb-8 italic">
                                Votre stratégie d'approvisionnement a été enregistrée. Passage au Dashboard pour le suivi logistique.
                            </p>
                            <div className="flex flex-col gap-3 py-6 border-y border-gray-50">
                                <div className="flex justify-between text-[10px] items-center">
                                    <span className="uppercase tracking-widest text-gray-400">Total Commande</span>
                                    <span className="font-bold text-derma-black font-mono">CHF {total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] items-center">
                                    <span className="uppercase tracking-widest text-gray-400">Profit Projeté</span>
                                    <span className="font-bold text-green-600 font-mono">CHF {cartKpis.profit.toFixed(2)}</span>
                                </div>
                            </div>
                            <Loader2 className="animate-spin text-derma-gold mx-auto mt-8" size={24} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FIXED PROFIT SUMMARY PANEL - GLASSMORPHIC REDESIGN */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 h-32 bg-black/80 backdrop-blur-2xl border-t border-white/10 p-6 z-40 flex items-center"
            >
                <div className="max-w-7xl mx-auto w-full grid grid-cols-2 lg:grid-cols-5 gap-8 items-center">
                    <div className="hidden lg:flex flex-col border-r border-white/10 pr-8">
                        <span className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-black mb-1">{t('order_avg_margin')}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-4xl font-oswald text-white tracking-tighter leading-none">{cartKpis.margin.toFixed(1)}%</span>
                            {cartKpis.margin > 40 && <Flame size={18} className="text-derma-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />}
                        </div>
                    </div>

                    <div className="flex flex-col border-r border-white/10 pr-8">
                        <span className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-black mb-1">{t('order_retail_val')}</span>
                        <span className="text-2xl font-mono text-gray-400 font-light tracking-tight leading-none">CHF {cartKpis.retail.toLocaleString()}</span>
                    </div>

                    <div className="flex flex-col border-r border-white/10 pr-8">
                        <span className="text-[9px] uppercase tracking-[0.3em] text-derma-gold font-black mb-1">{t('order_potential_profit')}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-oswald text-derma-gold tracking-tight leading-none">CHF {cartKpis.profit.toLocaleString()}</span>
                            <ArrowUpRight size={16} className="text-derma-gold opacity-50" />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-black mb-1">TOTAL COMMANDE (COÛT)</span>
                        <span className="text-3xl font-oswald text-white tracking-widest uppercase leading-none">CHF {total.toLocaleString()}</span>
                    </div>

                    <div className="col-span-2 lg:col-span-1 flex flex-col gap-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={total === 0 || submitted || isSubmitting}
                            className={`w-full py-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden flex items-center justify-center gap-3
                                ${submitted ? 'bg-green-600 text-white shadow-[0_0_30px_rgba(22,163,74,0.4)]' : 'bg-derma-gold text-derma-black hover:bg-white'}
                                ${total === 0 || isSubmitting ? 'opacity-30 cursor-not-allowed grayscale' : 'shadow-[0_15px_35px_rgba(212,175,55,0.2)]'}
                            `}
                        >
                            {isSubmitting ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <ShoppingCart size={14} />
                                    {t('order_submit')}
                                </>
                            )}
                        </motion.button>
                        {total > 0 && total < nextTierGoal && (
                            <div className="text-[8px] uppercase tracking-widest text-center text-derma-gold/60 font-black mt-1">
                                + CHF {(nextTierGoal - total).toFixed(0)} POUR NIVEAU {nextTierName.toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Order;