import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Eye, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle,
  X,
  Printer,
  Loader2
} from 'lucide-react';
import { AdminOrder, UserTier } from '../types';

const INITIAL_ORDERS: AdminOrder[] = [
  { 
    id: '#1256', date: '14.02.2025', partnerName: 'Institut Belle Étoile', tier: UserTier.PREMIUM, total: 919.40, status: 'PREPARATION', itemsCount: 17, shippingAddress: 'Rue de Lausanne 45, 1020 Renens',
    items: [
        { name: 'KRX Derma Shield SPF50', sku: 'KRX-DS50', quantity: 10, price: 45 },
        { name: 'Peptide Serum', sku: 'KRX-PS30', quantity: 5, price: 40.50 },
        { name: 'Meso Booster Boto-RX', sku: 'KRX-MBA-BRX', quantity: 2, price: 99 }
    ]
  },
  { id: '#1255', date: '14.02.2025', partnerName: 'Clinique Leman', tier: UserTier.STANDARD, total: 385, status: 'SHIPPED', itemsCount: 4 },
  { id: '#1254', date: '13.02.2025', partnerName: 'Beauty Lab Genève', tier: UserTier.PREMIUM, total: 920, status: 'DELIVERED', itemsCount: 8 },
  { id: '#1253', date: '12.02.2025', partnerName: 'Esthétique 3000', tier: UserTier.STANDARD, total: 150, status: 'CANCELLED', itemsCount: 2 },
  { id: '#1252', date: '12.02.2025', partnerName: 'Spa La Prairie', tier: UserTier.PREMIUM, total: 2450, status: 'DELIVERED', itemsCount: 24 },
  { id: '#1251', date: '11.02.2025', partnerName: 'Institut Belle Étoile', tier: UserTier.PREMIUM, total: 560, status: 'DELIVERED', itemsCount: 6 },
];

const AdminOrders: React.FC = () => {
  // Use state for orders to allow updates (Mark as Shipped)
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  
  // State for print loading effect
  const [isPrinting, setIsPrinting] = useState(false);

  const filteredOrders = orders.filter(o => 
    filterStatus === 'ALL' ? true : o.status === filterStatus
  );

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'PREPARATION':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"><Clock size={12}/> Préparation</span>;
      case 'SHIPPED':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20"><Truck size={12}/> Expédiée</span>;
      case 'DELIVERED':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"><CheckCircle size={12}/> Livrée</span>;
      case 'CANCELLED':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"><XCircle size={12}/> Annulée</span>;
      default:
        return null;
    }
  };

  // Helper to calculate totals inside the modal
  const getOrderTotals = (order: AdminOrder) => {
    const items = order.items || [
        { name: 'Produit Exemple A', sku: 'KRX-001', price: 50, quantity: 2 },
        { name: 'Produit Exemple B', sku: 'KRX-002', price: 120, quantity: 1 }
    ];

    const subTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const vatRate = 0.081; // 8.1% VAT
    const vatAmount = subTotal * vatRate;
    const shipping = 0;
    const total = subTotal + vatAmount + shipping;

    return { items, subTotal, vatAmount, shipping, total };
  };

  // --- ACTIONS ---

  const handleMarkAsShipped = () => {
    if (!selectedOrder) return;

    // 1. Create updated order object
    const updatedOrder = { ...selectedOrder, status: 'SHIPPED' as const };

    // 2. Update list state
    setOrders(prevOrders => 
        prevOrders.map(order => order.id === updatedOrder.id ? updatedOrder : order)
    );

    // 3. Update currently selected order view
    setSelectedOrder(updatedOrder);
  };

  const handlePrintInvoice = () => {
    setIsPrinting(true);
    // Simulate generation delay
    setTimeout(() => {
        setIsPrinting(false);
        window.print();
    }, 800);
  };

  return (
    <div className="space-y-6 print:hidden">
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2">
            <button 
                onClick={() => setFilterStatus('ALL')}
                className={`px-4 py-2 rounded text-[13px] font-medium transition-colors ${filterStatus === 'ALL' ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E0E0E0] text-[#1A1A1A] hover:bg-[#FAFAF8]'}`}
            >
                Toutes
            </button>
            <button 
                onClick={() => setFilterStatus('PREPARATION')}
                className={`px-4 py-2 rounded text-[13px] font-medium transition-colors ${filterStatus === 'PREPARATION' ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E0E0E0] text-[#1A1A1A] hover:bg-[#FAFAF8]'}`}
            >
                En cours
            </button>
            <button className="bg-white border border-[#E0E0E0] text-[#1A1A1A] px-4 py-2 rounded text-[13px] font-medium flex items-center gap-2 hover:bg-[#FAFAF8]">
                <Download size={16} /> Exporter
            </button>
        </div>
        
        <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Recherche commande, partenaire..." 
              className="pl-9 pr-4 py-2 bg-white border border-[#E0E0E0] rounded text-sm w-64 focus:outline-none focus:border-[#1A1A1A]"
            />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E8E8E8] rounded-lg overflow-hidden">
         <table className="w-full text-left">
             <thead className="bg-[#FAFAF8] border-b border-[#E8E8E8] text-[10px] uppercase tracking-wider text-[#6B6B6B] font-semibold">
                 <tr>
                     <th className="px-6 py-4">Commande</th>
                     <th className="px-6 py-4">Date</th>
                     <th className="px-6 py-4">Partenaire</th>
                     <th className="px-6 py-4 text-center">Articles</th>
                     <th className="px-6 py-4 text-right">Total</th>
                     <th className="px-6 py-4">Statut</th>
                     <th className="px-6 py-4 text-right">Action</th>
                 </tr>
             </thead>
             <tbody className="divide-y divide-[#F5F5F5]">
                 {filteredOrders.map(order => (
                     <tr key={order.id} className="hover:bg-[#FAFAF8] transition-colors group">
                         <td className="px-6 py-4 font-mono font-medium text-[#1A1A1A]">{order.id}</td>
                         <td className="px-6 py-4 text-sm text-[#6B6B6B]">{order.date}</td>
                         <td className="px-6 py-4">
                             <div className="text-sm font-medium text-[#1A1A1A]">{order.partnerName}</div>
                             {order.tier === UserTier.PREMIUM && <span className="text-[10px] text-[#C0A76A] font-bold">Premium</span>}
                         </td>
                         <td className="px-6 py-4 text-center text-sm text-[#6B6B6B]">{order.itemsCount}</td>
                         <td className="px-6 py-4 text-right font-oswald text-[#1A1A1A]">CHF {order.total.toFixed(2)}</td>
                         <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                         <td className="px-6 py-4 text-right">
                             <button 
                                onClick={() => setSelectedOrder(order)}
                                className="p-2 border border-[#E0E0E0] rounded bg-white hover:border-[#1A1A1A] hover:text-[#1A1A1A] text-gray-400 transition-colors"
                             >
                                 <Eye size={14} />
                             </button>
                         </td>
                     </tr>
                 ))}
             </tbody>
         </table>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0">
              <div className="absolute inset-0 bg-[#1A1A1A]/70 backdrop-blur-sm print:hidden" onClick={() => setSelectedOrder(null)}></div>
              <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-slide-up print:shadow-none print:max-w-none print:h-auto print:max-h-none">
                  
                  {/* Calculate totals on the fly for the modal */}
                  {(() => {
                      const { items, subTotal, vatAmount, total } = getOrderTotals(selectedOrder);
                      
                      return (
                        <>
                          <div className="bg-[#FAFAF8] px-8 py-6 border-b border-[#E8E8E8] flex justify-between items-start print:bg-white print:px-0">
                              <div>
                                  <div className="flex items-center gap-3">
                                    <h2 className="font-oswald text-xl text-[#1A1A1A] uppercase tracking-wide">Commande {selectedOrder.id}</h2>
                                    <div className="print:hidden">
                                        <StatusBadge status={selectedOrder.status} />
                                    </div>
                                  </div>
                                  <p className="font-sans text-sm text-[#6B6B6B] mt-1">{selectedOrder.partnerName} • {selectedOrder.date}</p>
                              </div>
                              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-[#1A1A1A] print:hidden">
                                  <X size={24} />
                              </button>
                          </div>

                          <div className="p-8 overflow-y-auto print:p-0 print:overflow-visible">
                              {/* Shipping Info */}
                              <div className="mb-8 p-4 border border-[#E8E8E8] rounded bg-[#FAFAF8] print:bg-white print:border-0 print:p-0">
                                  <h4 className="text-xs uppercase tracking-widest text-[#6B6B6B] mb-2 font-bold">Adresse de livraison</h4>
                                  <p className="text-sm text-[#1A1A1A]">{selectedOrder.shippingAddress || 'Adresse standard du partenaire'}</p>
                              </div>

                              {/* Items List */}
                              <table className="w-full text-left mb-8">
                                  <thead>
                                      <tr className="border-b border-[#E8E8E8] text-[10px] uppercase tracking-wider text-[#6B6B6B]">
                                          <th className="py-2">Produit</th>
                                          <th className="py-2 text-right">Prix</th>
                                          <th className="py-2 text-center">Qté</th>
                                          <th className="py-2 text-right">Total</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#F5F5F5]">
                                      {items.map((item, idx) => (
                                          <tr key={idx}>
                                              <td className="py-3">
                                                  <div className="text-sm font-medium text-[#1A1A1A]">{item.name}</div>
                                                  <div className="text-xs text-gray-400 font-mono">{item.sku}</div>
                                              </td>
                                              <td className="py-3 text-right text-sm">CHF {item.price.toFixed(2)}</td>
                                              <td className="py-3 text-center text-sm">{item.quantity}</td>
                                              <td className="py-3 text-right font-medium text-sm">CHF {(item.price * item.quantity).toFixed(2)}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>

                              {/* Totals */}
                              <div className="flex justify-end">
                                  <div className="w-56 space-y-2">
                                      <div className="flex justify-between text-sm text-[#6B6B6B]">
                                          <span>Sous-total HT</span>
                                          <span>CHF {subTotal.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm text-[#6B6B6B]">
                                          <span>TVA (8.1%)</span>
                                          <span>CHF {vatAmount.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm text-[#6B6B6B]">
                                          <span>Livraison</span>
                                          <span>CHF 0.00</span>
                                      </div>
                                      <div className="flex justify-between text-lg font-oswald text-[#1A1A1A] pt-2 border-t border-[#E8E8E8]">
                                          <span>Total TTC</span>
                                          <span>CHF {total.toFixed(2)}</span>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="bg-[#FAFAF8] px-8 py-4 border-t border-[#E8E8E8] flex justify-end gap-3 print:hidden">
                              <button 
                                onClick={handlePrintInvoice}
                                disabled={isPrinting}
                                className="px-4 py-2 bg-white border border-[#E0E0E0] rounded text-sm font-medium hover:bg-[#F5F5F5] text-[#1A1A1A] flex items-center gap-2"
                              >
                                  {isPrinting ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                                  Imprimer facture
                              </button>
                              
                              {selectedOrder.status === 'PREPARATION' && (
                                <button 
                                    onClick={handleMarkAsShipped}
                                    className="px-6 py-2 bg-[#1A1A1A] text-white rounded text-sm font-medium hover:bg-[#2C3E50] flex items-center gap-2"
                                >
                                    <Truck size={16} /> Marquer expédiée
                                </button>
                              )}
                          </div>
                        </>
                      );
                  })()}
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminOrders;