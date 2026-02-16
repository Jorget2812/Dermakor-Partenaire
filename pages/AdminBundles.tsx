import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Edit2,
    Search,
    Zap,
    Package,
    X,
    Loader2,
    CheckCircle,
    AlertCircle,
    Boxes
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useLanguage } from '../context/LanguageContext';
import { Product, StrategicPack } from '../types';

interface BundleDetail extends StrategicPack {
    is_active: boolean;
    bundle_items?: {
        id: string;
        product_id: string;
        quantity: number;
        products?: Product;
    }[];
}

const AdminBundles: React.FC = () => {
    const { t } = useLanguage();
    const [bundles, setBundles] = useState<BundleDetail[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBundle, setEditingBundle] = useState<Partial<BundleDetail> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBundles();
        fetchProducts();
    }, []);

    const fetchBundles = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('bundles')
                .select(`
                    *,
                    bundle_items (
                        id,
                        product_id,
                        quantity,
                        products (*)
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBundles(data || []);
        } catch (err) {
            console.error('Error fetching bundles:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'ACTIVE')
            .order('name');
        setProducts(data || []);
    };

    const handleSaveBundle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBundle?.name || !editingBundle?.price) return;

        try {
            const bundleData = {
                name: editingBundle.name,
                description: editingBundle.description,
                price: editingBundle.price,
                badge: editingBundle.badge,
                is_active: editingBundle.is_active ?? true
            };

            let bundleId = editingBundle.id;

            if (bundleId) {
                // Update
                const { error } = await supabase
                    .from('bundles')
                    .update(bundleData)
                    .eq('id', bundleId);
                if (error) throw error;

                // Delete old items and insert new ones
                await supabase.from('bundle_items').delete().eq('bundle_id', bundleId);
            } else {
                // Insert
                const { data, error } = await supabase
                    .from('bundles')
                    .insert([bundleData])
                    .select();
                if (error) throw error;
                bundleId = data[0].id;
            }

            // Insert bundle items
            const items = editingBundle.bundle_items?.map(item => ({
                bundle_id: bundleId,
                product_id: item.product_id,
                quantity: item.quantity
            })) || [];

            if (items.length > 0) {
                const { error: itemsError } = await supabase
                    .from('bundle_items')
                    .insert(items);
                if (itemsError) throw itemsError;
            }

            setIsModalOpen(false);
            setEditingBundle(null);
            fetchBundles();
        } catch (err: any) {
            console.error('Error saving bundle:', err);
            const detail = err.message || 'Error desconocido';
            alert(`Error al guardar el pack: ${detail}\n\nNota: Asegúrate de haber ejecutado el script SQL en Supabase.`);
        }
    };

    const handleDeleteBundle = async (id: string) => {
        if (!window.confirm('¿Confirmas que deseas eliminar este pack estratégico?')) return;
        try {
            const { error } = await supabase.from('bundles').delete().eq('id', id);
            if (error) throw error;
            fetchBundles();
        } catch (err) {
            console.error('Error deleting bundle:', err);
        }
    };

    const addItemToBundle = () => {
        const currentItems = editingBundle?.bundle_items || [];
        setEditingBundle({
            ...editingBundle,
            bundle_items: [...currentItems, { id: Math.random().toString(), product_id: '', quantity: 1 }]
        });
    };

    const removeItemFromBundle = (index: number) => {
        const currentItems = [...(editingBundle?.bundle_items || [])];
        currentItems.splice(index, 1);
        setEditingBundle({ ...editingBundle, bundle_items: currentItems });
    };

    const updateItemInBundle = (index: number, field: string, value: any) => {
        const currentItems = [...(editingBundle?.bundle_items || [])];
        currentItems[index] = { ...currentItems[index], [field]: value };
        setEditingBundle({ ...editingBundle, bundle_items: currentItems });
    };

    const filteredBundles = bundles.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-derma-bg/20 rounded-2xl overflow-hidden border border-derma-border shadow-soft">
            <div className="bg-white px-8 py-6 border-b border-derma-border">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="font-oswald text-2xl uppercase tracking-tighter text-derma-text flex items-center gap-2">
                            <Zap className="text-derma-gold" />
                            Packs Estratégicos
                        </h1>
                        <p className="text-[11px] text-derma-text-muted uppercase font-bold tracking-widest mt-1">
                            Gestión de bundles y ofertas de alta rotación
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingBundle({ is_active: true, bundle_items: [] });
                            setIsModalOpen(true);
                        }}
                        className="px-4 py-2 bg-derma-blue text-white rounded-lg text-[11px] font-black uppercase tracking-widest hover:shadow-lg transition-luxury flex items-center gap-2"
                    >
                        <Plus size={14} /> Nuevo Pack
                    </button>
                </div>

                <div className="mt-6 relative max-w-md">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-derma-text-muted" />
                    <input
                        type="text"
                        placeholder="Buscar packs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-derma-bg/30 border border-derma-border rounded-lg text-[11px] font-bold w-full focus:outline-none focus:bg-white focus:border-derma-blue transition-luxury"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {isLoading ? (
                    <div className="py-20 text-center">
                        <Loader2 size={32} className="animate-spin text-derma-gold mx-auto opacity-50" />
                    </div>
                ) : filteredBundles.length === 0 ? (
                    <div className="py-20 text-center">
                        <Boxes size={48} className="mx-auto text-derma-text-muted opacity-20 mb-4" />
                        <p className="text-[10px] font-black uppercase text-derma-text-muted tracking-widest">No hay packs configurados</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBundles.map((bundle) => (
                            <div key={bundle.id} className="bg-white border border-derma-border rounded-xl shadow-premium overflow-hidden group hover:shadow-xl transition-all duration-300">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${bundle.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {bundle.is_active ? 'Activo' : 'Borrador'}
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => {
                                                    setEditingBundle(bundle);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-1.5 text-derma-text-muted hover:text-derma-blue transition-colors"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBundle(bundle.id)}
                                                className="p-1.5 text-derma-text-muted hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="font-oswald text-lg text-derma-text uppercase mb-1">{bundle.name}</h3>
                                    {bundle.badge && (
                                        <div className="text-[9px] font-bold text-derma-gold mb-2 tracking-widest uppercase">{bundle.badge}</div>
                                    )}
                                    <p className="text-xs text-derma-text-muted font-light h-12 overflow-hidden mb-4">
                                        {bundle.description}
                                    </p>

                                    <div className="bg-derma-bg/30 rounded-lg p-4 mb-4">
                                        <div className="text-[10px] font-black text-derma-text-muted uppercase tracking-widest mb-2 border-b border-derma-border pb-1">Productos Incluidos</div>
                                        <ul className="space-y-1.5">
                                            {bundle.bundle_items?.map((item, idx) => (
                                                <li key={idx} className="flex justify-between items-center text-[11px]">
                                                    <span className="text-derma-text font-medium truncate">{item.products?.name}</span>
                                                    <span className="font-bold text-derma-blue">x{item.quantity}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex justify-between items-center mt-auto">
                                        <div className="text-lg font-bold text-derma-text">CHF {bundle.price}</div>
                                        <div className="text-[10px] font-bold text-derma-text-muted uppercase">
                                            {bundle.bundle_items?.length || 0} SKUs
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Creación/Edición */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-derma-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-derma-border flex justify-between items-center bg-derma-bg/10">
                            <div>
                                <h2 className="font-oswald text-xl text-derma-text uppercase">
                                    {editingBundle?.id ? 'Editar Pack' : 'Nuevo Pack Estratégico'}
                                </h2>
                                <p className="text-[10px] text-derma-text-muted font-bold uppercase tracking-widest">Configuración de oferta combinada</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-derma-text-muted hover:text-derma-text">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveBundle} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-derma-text-muted uppercase tracking-widest mb-2">Nombre del Pack</label>
                                    <input
                                        required
                                        type="text"
                                        value={editingBundle?.name || ''}
                                        onChange={(e) => setEditingBundle({ ...editingBundle, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-derma-bg/40 border border-derma-border rounded-lg text-sm focus:outline-none focus:border-derma-blue"
                                        placeholder="Ej: Pack Rotación Pro"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-derma-text-muted uppercase tracking-widest mb-2">Precio Pro (CHF)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={editingBundle?.price || ''}
                                        onChange={(e) => setEditingBundle({ ...editingBundle, price: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 bg-derma-bg/40 border border-derma-border rounded-lg text-sm focus:outline-none focus:border-derma-gold font-mono"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-derma-text-muted uppercase tracking-widest mb-2">Etiqueta (Badge)</label>
                                    <input
                                        type="text"
                                        value={editingBundle?.badge || ''}
                                        onChange={(e) => setEditingBundle({ ...editingBundle, badge: e.target.value })}
                                        className="w-full px-4 py-2 bg-derma-bg/40 border border-derma-border rounded-lg text-sm focus:outline-none focus:border-derma-blue uppercase"
                                        placeholder="Ej: MARGE HAUTE"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-derma-text-muted uppercase tracking-widest mb-2">Descripción Estratégica</label>
                                    <textarea
                                        value={editingBundle?.description || ''}
                                        onChange={(e) => setEditingBundle({ ...editingBundle, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-derma-bg/40 border border-derma-border rounded-lg text-sm focus:outline-none focus:border-derma-blue h-20 resize-none"
                                        placeholder="Beneficios para el partner..."
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-[10px] font-black text-derma-text-muted uppercase tracking-widest">Contenido del Pack</label>
                                    <button
                                        type="button"
                                        onClick={addItemToBundle}
                                        className="flex items-center gap-1.5 text-[10px] font-bold text-derma-blue hover:underline"
                                    >
                                        <Plus size={12} /> Añadir Producto
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {editingBundle?.bundle_items?.map((item, index) => (
                                        <div key={item.id} className="flex gap-3 items-end bg-derma-bg/20 p-3 rounded-lg border border-derma-border/50 animate-in slide-in-from-right-2">
                                            <div className="flex-1">
                                                <label className="block text-[8px] font-bold text-derma-text-muted uppercase mb-1">Producto</label>
                                                <select
                                                    value={item.product_id}
                                                    onChange={(e) => updateItemInBundle(index, 'product_id', e.target.value)}
                                                    className="w-full px-3 py-1.5 bg-white border border-derma-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-derma-blue"
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="w-24">
                                                <label className="block text-[8px] font-bold text-derma-text-muted uppercase mb-1">Cant.</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItemInBundle(index, 'quantity', parseInt(e.target.value))}
                                                    className="w-full px-3 py-1.5 bg-white border border-derma-border rounded text-xs text-center font-bold"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeItemFromBundle(index)}
                                                className="p-2 text-derma-text-muted hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!editingBundle?.bundle_items || editingBundle.bundle_items.length === 0) && (
                                        <div className="text-center py-8 border-2 border-dashed border-derma-border rounded-xl">
                                            <Package size={24} className="mx-auto text-derma-text-muted opacity-20 mb-2" />
                                            <p className="text-[10px] font-bold text-derma-text-muted uppercase">Añade productos para empezar</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-8">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={editingBundle?.is_active}
                                    onChange={(e) => setEditingBundle({ ...editingBundle, is_active: e.target.checked })}
                                    className="rounded border-derma-border text-derma-blue"
                                />
                                <label htmlFor="is_active" className="text-[10px] font-bold text-derma-text uppercase tracking-widest cursor-pointer">Activar inmediatamente para socios</label>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-derma-border">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-derma-blue text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-derma-blue/90 hover:shadow-lg transition-all"
                                >
                                    Guardar Pack Estratégico
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 bg-white border border-derma-border text-derma-text-muted rounded-lg text-xs font-black uppercase tracking-widest hover:bg-derma-bg transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBundles;
