import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import {
    Search,
    Plus,
    X,
    Trash2,
    RefreshCw,
    Library,
    TrendingUp,
    AlertCircle,
    Inbox
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { syncShopifyInventory } from '../utils/shopifySync';

const AdminCatalog: React.FC = () => {
    // --- STATE ---
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [isSyncing, setIsSyncing] = useState(false);

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

            setCategories(catData || []);
            const mappedProducts = (prodData || []).map(p => ({
                ...p,
                costPrice: p.cost_price,
                retailPrice: p.retail_price,
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
        const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory || p.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    const totalStockValue = products.reduce((acc, p) => acc + (Number(p.costPrice || 0) * (p.stock_quantity || 0)), 0);
    const lowStockCount = products.filter(p => (p.stock_quantity || 0) < 10).length;

    return (
        <div className="flex flex-col h-full bg-derma-bg/20 rounded-2xl overflow-hidden border border-derma-border shadow-soft relative">
            {/* Top Operational Bar */}
            <div className="bg-white p-8 border-b border-derma-border flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-30">
                <div className="flex items-center gap-10">
                    <div>
                        <h1 className="font-oswald text-2xl uppercase tracking-tighter text-derma-text">Contrôle de Stocks</h1>
                        <p className="text-[10px] text-derma-text-muted font-black uppercase tracking-[0.2em] mt-1 opacity-60">Gestion Opérationnelle du Catalogue</p>
                    </div>
                    <div className="h-10 w-px bg-derma-border"></div>
                    <div className="flex gap-8">
                        <div>
                            <span className="text-[9px] font-black text-derma-text-muted uppercase tracking-widest block mb-1">Inversion Stock</span>
                            <span className="text-lg font-oswald text-derma-blue">CHF {totalStockValue.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="text-[9px] font-black text-derma-text-muted uppercase tracking-widest block mb-1">Ruptures Critiques</span>
                            <span className={`text-lg font-oswald ${lowStockCount > 0 ? 'text-red-500' : 'text-derma-text'}`}>{lowStockCount}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-derma-text-muted transition-colors group-focus-within:text-derma-blue" />
                        <input
                            type="text"
                            placeholder="RECHERCHE SKU / NOM..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-2.5 bg-derma-bg/50 border border-derma-border rounded-full text-[10px] font-bold tracking-[0.1em] w-72 focus:outline-none focus:bg-white focus:border-derma-blue transition-luxury"
                        />
                    </div>
                    <button onClick={handleSync} disabled={isSyncing} className="p-3 bg-white border border-derma-border rounded-full hover:shadow-clinical transition-luxury text-derma-text-muted hover:text-derma-blue">
                        <RefreshCw size={18} className={isSyncing ? 'animate-spin text-derma-blue' : ''} />
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-derma-blue text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:-translate-y-0.5 transition-luxury">
                        <Plus size={16} />
                        Nouveau
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Side Navigation */}
                <aside className="w-72 bg-white/50 border-r border-derma-border flex flex-col p-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-derma-text-muted mb-4 px-2">Collections</h3>
                            <div className="space-y-1">
                                <button
                                    onClick={() => setSelectedCategory('ALL')}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-bold tracking-tight transition-luxury
                                    ${selectedCategory === 'ALL' ? 'bg-derma-blue text-white shadow-lg' : 'text-derma-text-muted hover:bg-white hover:text-derma-blue'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Library size={16} />
                                        <span>Toutes les collections</span>
                                    </div>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${selectedCategory === 'ALL' ? 'bg-white/20' : 'bg-derma-bg'}`}>
                                        {products.length}
                                    </span>
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-bold tracking-tight transition-luxury
                                        ${selectedCategory === cat.id ? 'bg-derma-blue text-white shadow-lg' : 'text-derma-text-muted hover:bg-white hover:text-derma-blue'}`}
                                    >
                                        <span className="truncate pr-2 text-left">{cat.name}</span>
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${selectedCategory === cat.id ? 'bg-white/20' : 'bg-derma-bg'}`}>
                                            {products.filter(p => p.categoryId === cat.id || p.category === cat.name).length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setIsCategoryModalOpen(true)}
                                className="w-full mt-6 py-2 text-[9px] font-black uppercase tracking-widest text-derma-text-muted hover:text-derma-blue border border-dashed border-derma-border rounded-lg transition-colors"
                            >
                                Gérer les catégories
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Table */}
                <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="bg-white border border-derma-border rounded-xl shadow-premium overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-derma-bg/10 border-b border-derma-border text-[9px] uppercase font-black tracking-[0.2em] text-derma-text-muted">
                                    <th className="px-8 py-5">Produit & Réf</th>
                                    <th className="px-8 py-5 text-center">Stock</th>
                                    <th className="px-8 py-5 text-center">Inversion</th>
                                    <th className="px-8 py-5 text-center">Rotation</th>
                                    <th className="px-8 py-5 text-right">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-derma-border">
                                {isLoading ? (
                                    <tr><td colSpan={5} className="py-20 text-center"><RefreshCw size={24} className="animate-spin mx-auto text-derma-gold opacity-50" /></td></tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr><td colSpan={5} className="py-20 text-center"><Inbox size={32} className="mx-auto text-derma-text-muted opacity-20 mb-4" /><p className="text-[10px] font-black uppercase text-derma-text-muted tracking-widest">Aucun produit trouvé</p></td></tr>
                                ) : filteredProducts.map(p => (
                                    <tr
                                        key={p.id}
                                        onClick={() => setSelectedProductId(p.id)}
                                        className="hover:bg-derma-bg/30 transition-luxury group cursor-pointer"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="text-[14px] font-bold text-derma-text group-hover:text-derma-gold transition-colors">{p.name}</div>
                                            <div className="flex items-center gap-2 mt-1 opacity-50">
                                                <span className="text-[9px] font-black uppercase tracking-widest">{p.sku}</span>
                                                <span className="w-1 h-1 rounded-full bg-derma-border"></span>
                                                <span className="text-[8px] font-black uppercase">{p.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className={`font-oswald text-[18px] ${(p.stock_quantity || 0) < 10 ? 'text-red-500 font-bold' : 'text-derma-text'}`}>
                                                {p.stock_quantity || 0}
                                            </div>
                                            <span className="text-[8px] font-black text-derma-text-muted uppercase tracking-tighter opacity-40">Unités</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="font-bold text-derma-text text-[13px]">
                                                CHF {((p.stock_quantity || 0) * (p.costPrice || 0)).toLocaleString()}
                                            </div>
                                            <span className="text-[8px] font-black text-derma-text-muted uppercase tracking-tighter opacity-40">Valeur d'inventaire</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="font-oswald text-[15px] text-derma-blue">{p.monthly_rotation || 0}</div>
                                                <div className="w-12 h-1 bg-derma-bg rounded-full mt-1 overflow-hidden">
                                                    <div className="h-full bg-derma-blue" style={{ width: `${Math.min((p.monthly_rotation || 0) * 5, 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                                ${(p.stock_quantity || 0) > 0 ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${(p.stock_quantity || 0) > 0 ? 'bg-[#10B981]' : 'bg-[#EF4444]'} animate-pulse`}></div>
                                                {(p.stock_quantity || 0) > 0 ? 'Disponible' : 'Rupture'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            {/* Product Detail Drawer */}
            {selectedProductId && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-derma-text/20 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedProductId(null)}></div>
                    <div className="relative w-[500px] bg-white h-full shadow-2xl border-l border-derma-border animate-slide-left p-10 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <span className="text-[10px] font-black text-derma-gold uppercase tracking-[0.2em] mb-2 block">Anatomie Opérationnelle</span>
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
                                    <span className="text-[9px] font-black text-derma-text-muted uppercase tracking-widest block mb-1">Rotation Mensuelle</span>
                                    <div className="text-3xl font-oswald text-derma-blue">{products.find(p => p.id === selectedProductId)?.monthly_rotation || 0}</div>
                                    <p className="text-[9px] text-derma-text-muted mt-2 font-medium">Unités vendues ce mois</p>
                                </div>
                                <div className="p-6 bg-derma-bg/30 rounded-2xl border border-derma-border shadow-sm">
                                    <span className="text-[9px] font-black text-derma-text-muted uppercase tracking-widest block mb-1">Profit Acumulé</span>
                                    <div className="text-3xl font-oswald text-[#10B981]">CHF {(products.find(p => p.id === selectedProductId)?.accumulated_profit || 0).toLocaleString()}</div>
                                    <p className="text-[9px] text-derma-text-muted mt-2 font-medium">Bénéfice brut total généré</p>
                                </div>
                            </div>

                            <div className="bg-white border border-derma-border rounded-2xl p-8 space-y-6 shadow-sm">
                                <h4 className="font-oswald text-sm uppercase tracking-widest flex items-center gap-3">
                                    <TrendingUp size={16} className="text-derma-gold" />
                                    Données Logistiques
                                </h4>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-[10px] font-black text-derma-text-muted uppercase mb-2 block">SKU Int./Ext.</label>
                                        <div className="font-mono text-sm font-bold bg-derma-bg px-4 py-2 rounded-lg border border-derma-border">{products.find(p => p.id === selectedProductId)?.sku}</div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-derma-text-muted uppercase mb-2 block">Stock Physique</label>
                                        <div className="font-oswald text-xl text-derma-text bg-derma-bg px-4 py-2 rounded-lg border border-derma-border">{products.find(p => p.id === selectedProductId)?.stock_quantity} <span className="text-[10px] uppercase font-black opacity-30">Units</span></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 bg-derma-text text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-derma-blue hover:shadow-xl transition-luxury">Éditer Fiche Technique</button>
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
            )}

            {/* Category Management Modal */}
            {isCategoryModalOpen && (
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
            )}

            {/* Add Product Modal */}
            {isAddModalOpen && (
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
            )}
        </div>
    );
};

export default AdminCatalog;