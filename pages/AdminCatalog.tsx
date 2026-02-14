import React, { useState, useEffect, useRef } from 'react';
import { PRODUCTS, PRODUCT_CATEGORIES } from '../constants';
import { Product } from '../types';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  AlertTriangle,
  Package,
  X,
  Trash2,
  Edit2,
  Check,
  ChevronDown
} from 'lucide-react';

const AdminCatalog: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStock, setSelectedStock] = useState<string>('ALL');

  // Add/Edit Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // New state to track editing
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: PRODUCT_CATEGORIES[1], 
    price: 0,
    stockStatus: 'IN_STOCK',
    description: ''
  });

  // Action Menu State
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Stock Simulation (kept from previous version)
  const [stockLevels, setStockLevels] = useState<Record<string, number>>(
    PRODUCTS.reduce((acc, p) => ({
      ...acc, 
      [p.id]: p.stockStatus === 'OUT_OF_STOCK' ? 0 : Math.floor(Math.random() * 100) + 5
    }), {})
  );

  // --- CLICK OUTSIDE LISTENER FOR ACTION MENU ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActiveActionId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- FILTER LOGIC ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesStock = selectedStock === 'ALL' || p.stockStatus === selectedStock;
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // --- HANDLERS ---
  
  const handleEdit = (product: Product) => {
    setNewProduct({ ...product });
    setEditingId(product.id);
    setIsAddModalOpen(true);
    setActiveActionId(null); // Close menu
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setActiveActionId(null);
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingId(null);
    setNewProduct({
      name: '',
      sku: '',
      category: PRODUCT_CATEGORIES[1],
      price: 0,
      stockStatus: 'IN_STOCK',
      description: ''
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
        // --- UPDATE EXISTING PRODUCT ---
        setProducts(prev => prev.map(p => {
            if (p.id === editingId) {
                return {
                    ...p,
                    ...newProduct,
                    // Ensure pricing base price updates if main price changed
                    pricing: {
                        ...p.pricing!,
                        basePrice: Number(newProduct.price)
                    }
                } as Product;
            }
            return p;
        }));
    } else {
        // --- CREATE NEW PRODUCT ---
        const id = `new-${Date.now()}`;
        const productToAdd: Product = {
          id,
          sku: newProduct.sku || `KRX-NEW-${Math.floor(Math.random()*1000)}`,
          name: newProduct.name || 'Nouveau Produit',
          category: newProduct.category || 'Gamme HomeCare',
          price: Number(newProduct.price) || 0,
          stockStatus: (newProduct.stockStatus as any) || 'IN_STOCK',
          description: newProduct.description || '',
          pricing: {
            basePrice: Number(newProduct.price) || 0,
            standard: { type: 'PERCENTAGE', value: 0 },
            premium: { type: 'PERCENTAGE', value: 10 }
          }
        };

        setProducts([productToAdd, ...products]);
        setStockLevels(prev => ({ ...prev, [id]: 50 })); // Default stock for new items
    }

    handleCloseModal();
  };

  // --- SUB-COMPONENTS ---

  const StockStatusBadge = ({ count }: { count: number }) => {
    if (count === 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">RUPTURE</span>;
    if (count < 10) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600"><AlertTriangle size={10}/> FAIBLE ({count})</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-600">{count} EN STOCK</span>;
  };

  return (
    <div className="space-y-6 relative min-h-[500px]">
       
       {/* Actions Bar */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-auto">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Rechercher produit, SKU..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-9 pr-4 py-2 bg-white border border-[#E0E0E0] rounded text-sm w-full md:w-80 focus:outline-none focus:border-[#1A1A1A]"
             />
          </div>
          
          <div className="flex gap-3 relative">
             {/* FILTER BUTTON & DROPDOWN */}
             <div className="relative">
                 <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`bg-white border text-[#1A1A1A] px-4 py-2 rounded text-[13px] font-medium flex items-center gap-2 hover:bg-[#FAFAF8] transition-colors
                        ${isFilterOpen || selectedCategory !== 'ALL' || selectedStock !== 'ALL' ? 'border-[#1A1A1A] bg-gray-50' : 'border-[#E0E0E0]'}
                    `}
                 >
                    <Filter size={16} /> 
                    Filtres
                    {(selectedCategory !== 'ALL' || selectedStock !== 'ALL') && (
                        <span className="w-2 h-2 bg-[#C0A76A] rounded-full ml-1"></span>
                    )}
                 </button>

                 {isFilterOpen && (
                     <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E0E0E0] shadow-xl rounded-lg z-30 p-4 animate-fade-in">
                        <div className="mb-4">
                            <label className="block text-[11px] uppercase text-[#6B6B6B] font-bold mb-2">Catégorie</label>
                            <select 
                                value={selectedCategory} 
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full text-sm border border-[#E0E0E0] rounded p-2 focus:outline-none focus:border-[#1A1A1A]"
                            >
                                <option value="ALL">Toutes les catégories</option>
                                {PRODUCT_CATEGORIES.filter(c => c !== "Tous les produits").map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-[11px] uppercase text-[#6B6B6B] font-bold mb-2">État du stock</label>
                            <select 
                                value={selectedStock} 
                                onChange={(e) => setSelectedStock(e.target.value)}
                                className="w-full text-sm border border-[#E0E0E0] rounded p-2 focus:outline-none focus:border-[#1A1A1A]"
                            >
                                <option value="ALL">Tous les statuts</option>
                                <option value="IN_STOCK">En Stock</option>
                                <option value="LOW_STOCK">Stock Faible</option>
                                <option value="OUT_OF_STOCK">Rupture</option>
                            </select>
                        </div>
                        <div className="flex justify-end pt-2 border-t border-[#F5F5F5]">
                            <button 
                                onClick={() => { setSelectedCategory('ALL'); setSelectedStock('ALL'); }}
                                className="text-xs text-red-500 hover:text-red-700 underline mr-auto"
                            >
                                Réinitialiser
                            </button>
                            <button 
                                onClick={() => setIsFilterOpen(false)}
                                className="text-xs bg-[#1A1A1A] text-white px-3 py-1 rounded"
                            >
                                Fermer
                            </button>
                        </div>
                     </div>
                 )}
             </div>

             {/* NEW PRODUCT BUTTON */}
             <button 
                onClick={() => {
                    setEditingId(null);
                    setIsAddModalOpen(true);
                }}
                className="bg-[#1A1A1A] text-white px-4 py-2 rounded text-[13px] font-semibold flex items-center gap-2 hover:bg-[#2C3E50] transition-colors shadow-sm active:transform active:scale-95"
             >
                <Plus size={16} /> Nouveau Produit
             </button>
          </div>
       </div>

       {/* CATALOG TABLE */}
       <div className="bg-white border border-[#E8E8E8] rounded-lg overflow-visible min-h-[400px]">
          <table className="w-full text-left border-collapse">
             <thead className="bg-[#FAFAF8] border-b border-[#E8E8E8] text-[10px] uppercase tracking-wider text-[#6B6B6B] font-semibold">
                 <tr>
                     <th className="px-6 py-4">Produit</th>
                     <th className="px-6 py-4">Catégorie</th>
                     <th className="px-6 py-4 text-center">Stock</th>
                     <th className="px-6 py-4 text-right">Prix Base</th>
                     <th className="px-6 py-4 text-right">Action</th>
                 </tr>
             </thead>
             <tbody className="divide-y divide-[#F5F5F5]">
                 {filteredProducts.map(product => (
                     <tr key={product.id} className="hover:bg-[#FAFAF8] transition-colors group relative">
                         <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                     <Package size={20} />
                                 </div>
                                 <div>
                                    <div className="font-medium text-[#1A1A1A] text-sm">{product.name}</div>
                                    <div className="text-xs text-gray-400 font-mono">{product.sku}</div>
                                 </div>
                             </div>
                         </td>
                         <td className="px-6 py-4 text-sm text-[#6B6B6B]">
                             {product.category}
                         </td>
                         <td className="px-6 py-4 text-center">
                             <StockStatusBadge count={stockLevels[product.id] || 0} />
                         </td>
                         <td className="px-6 py-4 text-right font-mono text-sm text-[#1A1A1A]">
                             CHF {product.price.toFixed(2)}
                         </td>
                         <td className="px-6 py-4 text-right relative">
                             {/* ACTION BUTTON (...) */}
                             <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveActionId(activeActionId === product.id ? null : product.id);
                                }}
                                className={`p-2 border rounded transition-colors ${activeActionId === product.id ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'border-[#E0E0E0] bg-white text-gray-400 hover:border-[#1A1A1A] hover:text-[#1A1A1A]'}`}
                             >
                                 <MoreHorizontal size={14} />
                             </button>

                             {/* CONTEXT MENU */}
                             {activeActionId === product.id && (
                                 <div 
                                    ref={actionMenuRef}
                                    className="absolute right-8 top-8 w-36 bg-white border border-[#E0E0E0] shadow-lg rounded-md z-50 overflow-hidden animate-scale-in origin-top-right"
                                 >
                                     <button 
                                        onClick={() => handleEdit(product)}
                                        className="w-full text-left px-4 py-2.5 text-xs text-[#1A1A1A] hover:bg-[#FAFAF8] flex items-center gap-2 transition-colors"
                                     >
                                         <Edit2 size={12} /> Éditer
                                     </button>
                                     <div className="h-px bg-[#F5F5F5]"></div>
                                     <button 
                                        onClick={() => handleDelete(product.id)}
                                        className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                     >
                                         <Trash2 size={12} /> Supprimer
                                     </button>
                                 </div>
                             )}
                         </td>
                     </tr>
                 ))}
                 {filteredProducts.length === 0 && (
                     <tr>
                         <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                             Aucun produit ne correspond à vos critères.
                         </td>
                     </tr>
                 )}
             </tbody>
          </table>
       </div>
       
       <div className="text-center text-xs text-gray-400 mt-4">
           {filteredProducts.length} produits affichés
       </div>

       {/* --- ADD/EDIT PRODUCT MODAL --- */}
       {isAddModalOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-[#1A1A1A]/70 backdrop-blur-sm" onClick={handleCloseModal}></div>
               <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl relative z-10 overflow-hidden animate-slide-up">
                   
                   <div className="bg-[#FAFAF8] px-6 py-4 border-b border-[#E8E8E8] flex justify-between items-center">
                       <h3 className="font-oswald text-lg text-[#1A1A1A] uppercase tracking-wide">
                           {editingId ? 'Modifier le produit' : 'Ajouter un produit'}
                       </h3>
                       <button onClick={handleCloseModal} className="text-gray-400 hover:text-[#1A1A1A]">
                           <X size={20} />
                       </button>
                   </div>

                   <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                       <div>
                           <label className="block text-[11px] uppercase font-bold text-[#6B6B6B] mb-1.5">Nom du produit</label>
                           <input 
                               type="text" 
                               required
                               value={newProduct.name}
                               onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                               className="w-full border border-[#E0E0E0] rounded p-2.5 text-sm focus:border-[#1A1A1A] focus:outline-none"
                               placeholder="Ex: Derma Repair Cream"
                           />
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-[11px] uppercase font-bold text-[#6B6B6B] mb-1.5">SKU (Réf)</label>
                               <input 
                                   type="text" 
                                   required
                                   value={newProduct.sku}
                                   onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                                   className="w-full border border-[#E0E0E0] rounded p-2.5 text-sm focus:border-[#1A1A1A] focus:outline-none"
                                   placeholder="KRX-..."
                               />
                           </div>
                           <div>
                               <label className="block text-[11px] uppercase font-bold text-[#6B6B6B] mb-1.5">Prix de base (CHF)</label>
                               <input 
                                   type="number" 
                                   required
                                   min="0"
                                   step="0.05"
                                   value={newProduct.price || ''}
                                   onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                                   className="w-full border border-[#E0E0E0] rounded p-2.5 text-sm focus:border-[#1A1A1A] focus:outline-none"
                                   placeholder="0.00"
                               />
                           </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-[11px] uppercase font-bold text-[#6B6B6B] mb-1.5">Catégorie</label>
                               <select 
                                   className="w-full border border-[#E0E0E0] rounded p-2.5 text-sm focus:border-[#1A1A1A] focus:outline-none bg-white"
                                   value={newProduct.category}
                                   onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                               >
                                   {PRODUCT_CATEGORIES.filter(c => c !== "Tous les produits").map(cat => (
                                       <option key={cat} value={cat}>{cat}</option>
                                   ))}
                               </select>
                           </div>
                           <div>
                               <label className="block text-[11px] uppercase font-bold text-[#6B6B6B] mb-1.5">Statut Stock</label>
                               <select 
                                   className="w-full border border-[#E0E0E0] rounded p-2.5 text-sm focus:border-[#1A1A1A] focus:outline-none bg-white"
                                   value={newProduct.stockStatus}
                                   onChange={e => setNewProduct({...newProduct, stockStatus: e.target.value as any})}
                               >
                                   <option value="IN_STOCK">En Stock</option>
                                   <option value="LOW_STOCK">Faible</option>
                                   <option value="OUT_OF_STOCK">Rupture</option>
                               </select>
                           </div>
                       </div>

                       <div className="pt-4 flex justify-end gap-3">
                           <button 
                               type="button"
                               onClick={handleCloseModal}
                               className="px-4 py-2 border border-[#E0E0E0] rounded text-sm hover:bg-[#F5F5F5]"
                           >
                               Annuler
                           </button>
                           <button 
                               type="submit"
                               className="px-6 py-2 bg-[#1A1A1A] text-white rounded text-sm font-medium hover:bg-[#2C3E50] flex items-center gap-2"
                           >
                               <Check size={16} /> {editingId ? 'Sauvegarder' : 'Créer'}
                           </button>
                       </div>
                   </form>
               </div>
           </div>
       )}

    </div>
  );
};

export default AdminCatalog;