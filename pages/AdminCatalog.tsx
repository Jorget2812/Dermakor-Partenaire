import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Product, Category } from '../types';
import {
    Search,
    Plus,
    X,
    Trash2,
    RefreshCw,
    Library,
    TrendingUp,
    Calendar,
    AlertCircle,
    Inbox,
    Download,
    Upload,
    SlidersHorizontal,
    LayoutGrid,
    ArrowUpDown
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { syncShopifyInventory } from '../utils/shopifySync';
import { useLanguage } from '../context/LanguageContext';

interface AdminCatalogProps {
    mode?: 'all' | 'collections' | 'inventory';
}

const AdminCatalog: React.FC<AdminCatalogProps> = ({ mode = 'all' }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t } = useLanguage();

    // --- STATE ---
    const [products, setProducts] = React.useState<Product[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [committedMap, setCommittedMap] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
    const [selectedStatus, setSelectedStatus] = React.useState('ALL');
    const [isSyncing, setIsSyncing] = useState(false);

    // Sync category from URL if present
    useEffect(() => {
        const catId = searchParams.get('category');
        if (catId) setSelectedCategory(catId);
    }, [searchParams]);

    // Modals & Panels
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    // Form State
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newProduct, setNewProduct] = useState<Partial<Product>>({
        name: '',
        sku: '',
        categoryId: '',
        price: 0,
        costPrice: 0,
        retailPrice: 0,
        stock_quantity: 0,
        description: ''
    });

    // --- DATA FETCHING ---
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const { data: catData } = await supabase.from('categories').select('*').order('order_index');
            const { data: prodData } = await supabase.from('products').select('*').order('name');
            const { data: ordersData } = await supabase.from('orders').select('items').eq('status', 'PREPARATION');

            // Calculate Committed Quantities
            const committed: Record<string, number> = {};
            (ordersData || []).forEach(order => {
                const items = (order.items || []) as any[];
                items.forEach(item => {
                    if (item.sku) {
                        committed[item.sku] = (committed[item.sku] || 0) + (item.quantity || 0);
                    }
                });
            });
            setCommittedMap(committed);

            setCategories(catData || []);
            const mappedProducts = (prodData || []).map(p => ({
                ...p,
                costPrice: p.cost_price,
                retailPrice: p.retail_price,
                categoryId: p.category_id, // Map database column to camelCase property
                stock_quantity: p.stock_quantity || 0,
                accumulated_profit: p.accumulated_profit || 0,
                monthly_rotation: p.monthly_rotation || 0
            }));
            setProducts(mappedProducts);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- HANDLERS ---
    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const result = await syncShopifyInventory(import.meta.env.VITE_SHOPIFY_STORE, import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN);
            if (result.success) await fetchData();
        } catch (err) { console.error(err); }
        finally { setIsSyncing(false); }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-');
            const { error } = await supabase.from('categories').insert([{ name: newCategoryName, slug }]);
            if (error) throw error;
            setNewCategoryName('');
            await fetchData();
        } catch (err) { console.error(err); }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        if (!window.confirm(`Supprimer la catégorie "${name}" ?`)) return;
        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            await fetchData();
        } catch (err) { console.error(err); }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!window.confirm('Supprimer ce produit ?')) return;
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            setSelectedProductId(null);
            await fetchData();
        } catch (err) { console.error(err); }
    };

    const handleUpdateStock = async (id: string, newQty: number) => {
        try {
            const { error } = await supabase.from('products').update({ stock_quantity: newQty }).eq('id', id);
            if (error) throw error;
            setProducts(products.map(p => p.id === id ? { ...p, stock_quantity: newQty } : p));
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la mise à jour du stock');
        }
    };

    const handleUpdateAvailable = async (id: string, newAvailable: number, committed: number) => {
        const newStock = newAvailable + committed;
        await handleUpdateStock(id, newStock);
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: newProduct.name,
                sku: newProduct.sku,
                category_id: newProduct.categoryId,
                category: categories.find(c => c.id === newProduct.categoryId)?.name || '',
                price: newProduct.price,
                cost_price: newProduct.costPrice,
                retail_price: newProduct.retailPrice,
                stock_quantity: newProduct.stock_quantity,
                description: newProduct.description
            };

            const { error } = await supabase.from('products').insert([payload]);
            if (error) throw error;
            setIsAddModalOpen(false);
            setNewProduct({ name: '', sku: '', categoryId: '', price: 0, costPrice: 0, retailPrice: 0, stock_quantity: 0, description: '' });
            await fetchData();
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la sauvegarde');
        }
    };

    // --- FILTERS & METRICS ---
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory || p.category === categories.find(c => c.id === selectedCategory)?.name;
        const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const totalStockValue = products.reduce((acc, p) => acc + (Number(p.costPrice || 0) * (p.stock_quantity || 0)), 0);
    const lowStockCount = products.filter(p => (p.stock_quantity || 0) < 10).length;

    return (
        <div className="flex flex-col h-full bg-derma-bg/20 rounded-2xl overflow-hidden border border-derma-border shadow-soft relative">
            {/* Metrics Bar */}
            <div className="bg-white px-8 py-5 border-b border-derma-border flex items-center gap-12 overflow-x-auto custom-scrollbar">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-derma-bg/50 rounded-lg border border-derma-border">
                    <Calendar size={14} className="text-derma-text-muted" />
                    <span className="text-[11px] font-bold text-derma-text">30 {t('common_days')}</span>
                </div>
                <div className="flex flex-col gap-1 min-w-[180px]">
                    <span className="text-[10px] uppercase font-black text-derma-text-muted tracking-widest leading-none">{t('catalog_metric_sales_rate')}</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-derma-text">4,28 %</span>
                        <span className="text-[10px] text-gray-400">---</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1 min-w-[220px]">
                    <span className="text-[10px] uppercase font-black text-derma-text-muted tracking-widest leading-none">{t('catalog_metric_inventory_days')}</span>
                    <span className="text-xs font-medium text-gray-400">---</span>
                </div>
                <div className="flex flex-col gap-1 min-w-[180px]">
                    <span className="text-[10px] uppercase font-black text-derma-text-muted tracking-widest leading-none">{t('catalog_metric_abc_analysis')}</span>
                    <div className="flex gap-3 mt-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-derma-blue">0</span>
                            <span className="px-1 bg-derma-blue text-white text-[8px] font-black rounded-sm">A</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-purple-500">0</span>
                            <span className="px-1 bg-purple-500 text-white text-[8px] font-black rounded-sm">B</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-gray-400">0</span>
                            <span className="px-1 bg-gray-400 text-white text-[8px] font-black rounded-sm">C</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header Area */}
            <div className="bg-white px-8 py-6 border-b border-derma-border">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="font-oswald text-2xl uppercase tracking-tighter text-derma-text">
                            {mode === 'all' ? t('admin_nav_products') : mode === 'inventory' ? t('admin_nav_inventory') : t('admin_nav_collections')}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-white border border-derma-border rounded-lg text-[11px] font-black uppercase tracking-widest text-derma-text hover:bg-derma-bg transition-luxury">
                            {t('common_export')}
                        </button>
                        <button className="px-4 py-2 bg-white border border-derma-border rounded-lg text-[11px] font-black uppercase tracking-widest text-derma-text hover:bg-derma-bg transition-luxury">
                            {t('common_import')}
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2 bg-derma-blue text-white rounded-lg text-[11px] font-black uppercase tracking-widest hover:shadow-lg transition-luxury flex items-center gap-2"
                        >
                            <Plus size={14} /> {t('common_add_product')}
                        </button>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {['ALL', 'ACTIVE', 'DRAFT', 'ARCHIVED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setSelectedStatus(status)}
                                className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-luxury
                                ${selectedStatus === status ? 'bg-derma-bg text-derma-text' : 'text-derma-text-muted hover:bg-derma-bg/50'}`}
                            >
                                {status === 'ALL' ? t('catalog_tab_all') : status === 'ACTIVE' ? t('catalog_tab_active') : status === 'DRAFT' ? t('catalog_tab_draft') : t('catalog_tab_archived')}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative group">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-derma-text-muted transition-colors group-focus-within:text-derma-blue" />
                            <input
                                type="text"
                                placeholder={t('catalog_search_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-derma-bg/30 border border-derma-border rounded-lg text-[11px] font-bold w-48 focus:outline-none focus:bg-white focus:border-derma-blue transition-luxury"
                            />
                        </div>
                        <button className="p-2 bg-white border border-derma-border rounded-lg text-derma-text-muted hover:text-derma-blue transition-luxury shadow-sm">
                            <SlidersHorizontal size={14} />
                        </button>
                        <button className="p-2 bg-white border border-derma-border rounded-lg text-derma-text-muted hover:text-derma-blue transition-luxury shadow-sm">
                            <ArrowUpDown size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="bg-white border border-derma-border rounded-xl shadow-premium overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-derma-border text-[11px] font-bold text-gray-500">
                                <th className="px-6 py-4 w-10">
                                    <input type="checkbox" className="rounded border-gray-300" />
                                </th>
                                {mode === 'all' ? (
                                    <>
                                        <th className="px-6 py-4 font-bold flex items-center gap-1 cursor-pointer">
                                            {t('catalog_table_product')} <ArrowUpDown size={12} />
                                        </th>
                                        <th className="px-6 py-4">{t('catalog_table_status')}</th>
                                        <th className="px-6 py-4 text-center">{t('catalog_table_inventory')}</th>
                                        <th className="px-6 py-4">{t('catalog_table_category')}</th>
                                        <th className="px-6 py-4 text-right">{t('catalog_table_channels')}</th>
                                    </>
                                ) : mode === 'collections' ? (
                                    <>
                                        <th className="px-6 py-4 font-bold flex items-center gap-1 cursor-pointer">
                                            {t('catalog_table_title')} <ArrowUpDown size={12} />
                                        </th>
                                        <th className="px-6 py-4">{t('admin_nav_products')}</th>
                                        <th className="px-6 py-4">{t('catalog_table_conditions')}</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4 font-bold flex items-center gap-1 cursor-pointer">
                                            {t('catalog_table_product')} <ArrowUpDown size={12} />
                                        </th>
                                        <th className="px-6 py-4">{t('catalog_table_sku')}</th>
                                        <th className="px-6 py-4 text-center border-b-2 border-dotted border-gray-200">{t('catalog_table_unavailable')}</th>
                                        <th className="px-6 py-4 text-center border-b-2 border-dotted border-gray-200">{t('catalog_table_committed')}</th>
                                        <th className="px-6 py-4 text-center border-b-2 border-dotted border-gray-200">{t('catalog_table_available')}</th>
                                        <th className="px-6 py-4 text-center">{t('catalog_table_on_hand')}</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-derma-border">
                            {isLoading ? (
                                <tr><td colSpan={6} className="py-20 text-center"><RefreshCw size={24} className="animate-spin mx-auto text-derma-gold opacity-50" /></td></tr>
                            ) : mode === 'collections' ? (
                                categories.map(cat => (
                                    <tr key={cat.id} className="hover:bg-derma-bg/10 border-b border-derma-border group" onClick={() => navigate(`/admin/products?category=${cat.id}`)}>
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <input type="checkbox" className="rounded border-gray-300" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-derma-bg/50 overflow-hidden border border-derma-border shrink-0 flex items-center justify-center">
                                                    <Library size={16} className="text-derma-text-muted opacity-30" />
                                                </div>
                                                <button
                                                    className="text-[13px] font-bold text-derma-text hover:text-derma-blue hover:underline text-left"
                                                >
                                                    {cat.name}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[13px] text-derma-text">
                                            {products.filter(p => p.categoryId === cat.id).length}
                                        </td>
                                        <td className="px-6 py-4 text-[13px] text-gray-400 font-medium">
                                            ---
                                        </td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan={6} className="py-20 text-center"><Inbox size={32} className="mx-auto text-derma-text-muted opacity-20 mb-4" /><p className="text-[10px] font-black uppercase text-derma-text-muted tracking-widest">{t('common_no_results')}</p></td></tr>
                            ) : filteredProducts.map(p => {
                                const committed = committedMap[p.sku || ''] || 0;
                                const inStock = p.stock_quantity || 0;
                                const available = inStock - committed;

                                if (mode === 'all') {
                                    return (
                                        <tr key={p.id} className="hover:bg-derma-bg/10 border-b border-derma-border group" onClick={() => setSelectedProductId(p.id)}>
                                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                <input type="checkbox" className="rounded border-gray-300" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-derma-bg/50 overflow-hidden border border-derma-border shrink-0 flex items-center justify-center">
                                                        <Library size={16} className="text-derma-text-muted opacity-30" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="text-[13px] font-bold text-derma-text">{p.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-medium">Ref: {p.sku || '---'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                                                        ${p.status === 'ACTIVE' ? 'bg-[#D1FAE5] text-[#059669]' :
                                                        p.status === 'DRAFT' ? 'bg-[#F3F4F6] text-[#4B5563]' :
                                                            'bg-[#FEE2E2] text-[#DC2626]'}`}>
                                                    {p.status === 'ACTIVE' ? t('common_active') : p.status === 'ARCHIVED' ? t('common_archived') : t('common_draft')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`text-[12px] font-bold ${inStock > 0 ? 'text-[#DC2626]' : 'text-gray-400'}`}>
                                                    {inStock} {t('common_in_stock')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-[12px] text-gray-600 font-medium">{p.category}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-[12px] font-bold text-gray-700">
                                                {p.channels || 6}
                                            </td>
                                        </tr>
                                    );
                                }

                                return (
                                    <tr
                                        key={p.id}
                                        className="hover:bg-derma-bg/10 border-b border-derma-border group"
                                    >
                                        <td className="px-6 py-4">
                                            <input type="checkbox" className="rounded border-gray-300" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-derma-bg/50 overflow-hidden border border-derma-border shrink-0 flex items-center justify-center">
                                                    <Library size={16} className="text-derma-text-muted opacity-30" />
                                                </div>
                                                <div className="text-[13px] font-bold text-derma-text">{p.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[12px] text-gray-500 font-medium">
                                            {p.sku || 'Sin SKU'}
                                        </td>
                                        <td className="px-6 py-4 text-center text-[12px] font-medium text-gray-500">
                                            0
                                        </td>
                                        <td className="px-6 py-4 text-center text-[12px] font-medium text-gray-500">
                                            {committed}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="number"
                                                disabled
                                                value={available}
                                                className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-center font-medium bg-gray-50 text-gray-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="number"
                                                defaultValue={inStock}
                                                onBlur={(e) => handleUpdateStock(p.id, parseInt(e.target.value))}
                                                className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-center font-medium focus:ring-2 focus:ring-derma-blue/20 transition-luxury"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Detail Drawer */}
            {
                selectedProductId && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <div className="absolute inset-0 bg-derma-text/20 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedProductId(null)}></div>
                        <div className="relative w-[500px] bg-white h-full shadow-2xl border-l border-derma-border animate-slide-left p-10 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <span className="text-[10px] font-black text-derma-gold uppercase tracking-[0.2em] mb-2 block">{t('catalog_drawer_anatomy')}</span>
                                    <h2 className="font-oswald text-3xl uppercase tracking-tight text-derma-text leading-tight">
                                        {products.find(p => p.id === selectedProductId)?.name}
                                    </h2>
                                </div>
                                <button onClick={() => setSelectedProductId(null)} className="w-10 h-10 rounded-full border border-derma-border flex items-center justify-center text-derma-text-muted hover:border-derma-blue hover:text-derma-blue transition-luxury">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-derma-bg/30 rounded-2xl border border-derma-border shadow-sm">
                                        <span className="text-[9px] font-black text-derma-text-muted uppercase tracking-widest block mb-1">{t('catalog_drawer_rotation')}</span>
                                        <div className="text-3xl font-oswald text-derma-blue">{products.find(p => p.id === selectedProductId)?.monthly_rotation || 0}</div>
                                        <p className="text-[9px] text-derma-text-muted mt-2 font-medium">{t('catalog_drawer_sold_this_month')}</p>
                                    </div>
                                    <div className="p-6 bg-derma-bg/30 rounded-2xl border border-derma-border shadow-sm">
                                        <span className="text-[9px] font-black text-derma-text-muted uppercase tracking-widest block mb-1">{t('catalog_drawer_accumulated_profit')}</span>
                                        <div className="text-3xl font-oswald text-[#10B981]">CHF {(products.find(p => p.id === selectedProductId)?.accumulated_profit || 0).toLocaleString()}</div>
                                        <p className="text-[9px] text-derma-text-muted mt-2 font-medium">{t('catalog_drawer_total_benefit')}</p>
                                    </div>
                                </div>

                                <div className="bg-white border border-derma-border rounded-2xl p-8 space-y-6 shadow-sm">
                                    <h4 className="font-oswald text-sm uppercase tracking-widest flex items-center gap-3">
                                        <TrendingUp size={16} className="text-derma-gold" />
                                        {t('catalog_drawer_logistics')}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[10px] font-black text-derma-text-muted uppercase mb-2 block">SKU Int./Ext.</label>
                                            <div className="font-mono text-sm font-bold bg-derma-bg px-4 py-2 rounded-lg border border-derma-border">{products.find(p => p.id === selectedProductId)?.sku}</div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-derma-text-muted uppercase mb-2 block">{t('catalog_drawer_physical_stock')}</label>
                                            <div className="font-oswald text-xl text-derma-text bg-derma-bg px-4 py-2 rounded-lg border border-derma-border">{products.find(p => p.id === selectedProductId)?.stock_quantity} <span className="text-[10px] uppercase font-black opacity-30">{t('catalog_drawer_units')}</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button className="flex-1 bg-derma-text text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-derma-blue hover:shadow-xl transition-luxury">{t('catalog_drawer_edit_tech_sheet')}</button>
                                    <button
                                        onClick={() => handleDeleteProduct(selectedProductId!)}
                                        className="w-16 h-14 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100 hover:bg-red-500 hover:text-white transition-luxury shadow-sm"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Category Management Modal */}
            {
                isCategoryModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-derma-text/40 backdrop-blur-md" onClick={() => setIsCategoryModalOpen(false)}></div>
                        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                            <div className="p-6 border-b border-derma-border flex justify-between items-center bg-derma-bg/10">
                                <h3 className="font-oswald text-lg uppercase tracking-wider">Collections</h3>
                                <button onClick={() => setIsCategoryModalOpen(false)} className="text-derma-text-muted hover:text-derma-blue transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nouveau nom..."
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="flex-1 px-4 py-2 bg-derma-bg rounded-lg border border-derma-border text-sm focus:outline-none focus:border-derma-blue"
                                    />
                                    <button
                                        onClick={handleAddCategory}
                                        className="bg-derma-blue text-white px-4 py-2 rounded-lg hover:shadow-lg transition-luxury"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="flex justify-between items-center p-3 bg-derma-bg/20 rounded-xl border border-derma-border group">
                                            <span className="text-[13px] font-bold text-derma-text">{cat.name}</span>
                                            <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="text-derma-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-luxury p-1">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Add Product Modal */}
            {
                isAddModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-derma-text/40 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)}></div>
                        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                            <div className="p-6 border-b border-derma-border flex justify-between items-center bg-derma-bg/10">
                                <h3 className="font-oswald text-lg uppercase tracking-wider">Nouveau Produit</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-derma-text-muted hover:text-derma-blue transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-derma-text-muted mb-1 block">Nom</label>
                                    <input type="text" required value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full px-4 py-2 bg-derma-bg border border-derma-border rounded-lg text-sm focus:outline-none focus:border-derma-blue" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-derma-text-muted mb-1 block">SKU</label>
                                        <input type="text" required value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} className="w-full px-4 py-2 bg-derma-bg border border-derma-border rounded-lg text-sm focus:outline-none focus:border-derma-blue" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-derma-text-muted mb-1 block">Collection</label>
                                        <select value={newProduct.categoryId} onChange={e => setNewProduct({ ...newProduct, categoryId: e.target.value })} className="w-full px-4 py-2 bg-derma-bg border border-derma-border rounded-lg text-sm focus:outline-none focus:border-derma-blue">
                                            <option value="">Sélectionner...</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-derma-text-muted mb-1 block">Coût (CHF)</label>
                                        <input type="number" required value={newProduct.costPrice || ''} onChange={e => setNewProduct({ ...newProduct, costPrice: Number(e.target.value) })} className="w-full px-4 py-2 bg-derma-bg border border-derma-border rounded-lg text-sm focus:outline-none focus:border-derma-blue" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-derma-text-muted mb-1 block">B2B (CHF)</label>
                                        <input type="number" required value={newProduct.price || ''} onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })} className="w-full px-4 py-2 bg-derma-bg border border-derma-border rounded-lg text-sm focus:outline-none focus:border-derma-blue" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-derma-text-muted mb-1 block">Stock</label>
                                        <input type="number" required value={newProduct.stock_quantity || ''} onChange={e => setNewProduct({ ...newProduct, stock_quantity: Number(e.target.value) })} className="w-full px-4 py-2 bg-derma-bg border border-derma-border rounded-lg text-sm focus:outline-none focus:border-derma-blue" />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2 text-[11px] font-black uppercase tracking-widest text-derma-text-muted">Annuler</button>
                                    <button type="submit" className="px-8 py-2 bg-derma-blue text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:shadow-lg transition-luxury">Enregistrer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminCatalog;