
import React, { useState, useRef } from 'react';
import { StockItem } from '../types';
import { Package, Plus, Minus, AlertTriangle, Search, ShoppingCart, Users, Building2, MessageCircle, CheckCircle, XCircle, Camera, Image as ImageIcon } from 'lucide-react';
import { RESIDENTS } from '../constants';

interface InventoryTabProps {
  stockItems: StockItem[];
  onUpdateStock: (item: StockItem) => void;
}

const InventoryTab: React.FC<InventoryTabProps> = ({ stockItems, onUpdateStock }) => {
  const [activeTab, setActiveTab] = useState<'COMPANY' | 'RESIDENT'>('COMPANY');
  const [selectedResidentId, setSelectedResidentId] = useState<string>(RESIDENTS[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | StockItem['category']>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  const filteredItems = stockItems.filter(item => {
    // 1. Filter by Tab (Owner)
    if (activeTab === 'COMPANY' && item.ownerType !== 'COMPANY') return false;
    if (activeTab === 'RESIDENT') {
       if (item.ownerType !== 'RESIDENT') return false;
       if (item.residentId !== selectedResidentId) return false;
    }

    // 2. Filter by Search
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 3. Filter by Category
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    // 4. Filter by Low Stock
    const isLowStock = item.quantity <= item.threshold;
    const matchesLowStock = showLowStockOnly ? isLowStock : true;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleQuantityChange = (item: StockItem, delta: number) => {
    const newQuantity = Math.max(0, item.quantity + delta);
    
    // If quantity goes above threshold, reset order requested status
    const shouldResetStatus = newQuantity > item.threshold;
    
    onUpdateStock({ 
        ...item, 
        quantity: newQuantity,
        isOrderRequested: shouldResetStatus ? false : item.isOrderRequested
    });
  };

  const toggleOrderStatus = (item: StockItem) => {
    onUpdateStock({ ...item, isOrderRequested: !item.isOrderRequested });
  };

  const handleShareOrderList = () => {
    // Filter items that are low stock AND not yet requested
    const itemsToOrder = stockItems.filter(item => {
        const isCorrectOwner = activeTab === 'COMPANY' ? item.ownerType === 'COMPANY' : (item.ownerType === 'RESIDENT' && item.residentId === selectedResidentId);
        return isCorrectOwner && item.quantity <= item.threshold && !item.isOrderRequested;
    });

    if (itemsToOrder.length === 0) {
        const alreadyRequested = stockItems.filter(item => {
            const isCorrectOwner = activeTab === 'COMPANY' ? item.ownerType === 'COMPANY' : (item.ownerType === 'RESIDENT' && item.residentId === selectedResidentId);
            return isCorrectOwner && item.quantity <= item.threshold && item.isOrderRequested;
        });

        if (alreadyRequested.length > 0) {
            if(window.confirm('未発注の不足アイテムはありませんが、発注済みの不足アイテムを再度共有しますか？')) {
                 // Share already requested items without updating status
                 const title = activeTab === 'COMPANY' ? '【会社備品 再共有】' : `【${RESIDENTS.find(r => r.id === selectedResidentId)?.name}様 再共有】`;
                 const listText = alreadyRequested.map(item => `・${item.name}: 残${item.quantity}${item.unit} (発注済)`).join('\n');
                 const message = `${title}\n${listText}\n\n※状況確認用`;
                 window.open(`https://line.me/R/msg/text/?${encodeURIComponent(message)}`, '_blank');
            }
            return;
        }
        alert('発注が必要な不足アイテムはありません。');
        return;
    }

    const title = activeTab === 'COMPANY' ? '【会社備品 発注依頼】' : `【${RESIDENTS.find(r => r.id === selectedResidentId)?.name}様 個別発注依頼】`;
    const listText = itemsToOrder.map(item => `・${item.name}: 残${item.quantity}${item.unit} (発注点:${item.threshold})`).join('\n');
    const message = `${title}\n${listText}\n\n在庫が不足しています。発注をお願いします。`;

    const url = `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    // Mark items as ordered after sharing
    itemsToOrder.forEach(item => {
        onUpdateStock({ ...item, isOrderRequested: true });
    });
  };

  const handleSingleItemShare = (item: StockItem) => {
    const ownerName = item.ownerType === 'COMPANY' ? '会社備品' : RESIDENTS.find(r => r.id === item.residentId)?.name + '様';
    const message = `【発注依頼】\n${ownerName}\n\n商品名: ${item.name}\n現在在庫: ${item.quantity}${item.unit}\n発注点: ${item.threshold}\n\n在庫が不足しています。手配をお願いします。`;
    const url = `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    
    // Mark as ordered
    if (item.quantity <= item.threshold) {
        onUpdateStock({ ...item, isOrderRequested: true });
    }
  };
  
  const handleImageClick = (itemId: string) => {
    setUploadingItemId(itemId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingItemId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const itemToUpdate = stockItems.find(i => i.id === uploadingItemId);
        if (itemToUpdate) {
          onUpdateStock({ ...itemToUpdate, imageUrl: reader.result as string });
        }
        setUploadingItemId(null);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Calculate count of items that need ordering (Low stock & Unsent)
  const pendingOrderCount = filteredItems.filter(i => i.quantity <= i.threshold && !i.isOrderRequested).length;

  return (
    <div className="pb-20 bg-gray-50 min-h-full">
      <div className="bg-white p-4 border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-green-600" />
          在庫管理・発注
        </h2>

        {/* Tabs: Company vs Resident */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
            <button
              onClick={() => setActiveTab('COMPANY')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'COMPANY' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
            >
                <Building2 className="w-4 h-4" /> 会社備品
            </button>
            <button
              onClick={() => setActiveTab('RESIDENT')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'RESIDENT' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
            >
                <Users className="w-4 h-4" /> 利用者個別
            </button>
        </div>

        {/* Resident Selector */}
        {activeTab === 'RESIDENT' && (
            <div className="mb-3 overflow-x-auto no-scrollbar flex gap-2 pb-1">
                {RESIDENTS.map(r => (
                    <button
                        key={r.id}
                        onClick={() => setSelectedResidentId(r.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-colors ${
                            selectedResidentId === r.id 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-white border-gray-200 text-gray-600'
                        }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${r.avatarColor}`}></div>
                        {r.name}
                    </button>
                ))}
            </div>
        )}
        
        {/* Filters */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              placeholder="備品を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3 rounded-lg border flex items-center gap-1 text-xs font-bold transition-colors flex-shrink-0 ${
              showLowStockOnly 
                ? 'bg-red-50 border-red-200 text-red-600 ring-2 ring-red-100' 
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${showLowStockOnly ? 'fill-red-100' : ''}`} />
            <span className="whitespace-nowrap">不足のみ</span>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(['all', 'daily', 'medical', 'food', 'other'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                filterCategory === cat 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'すべて' : 
               cat === 'daily' ? '日用品' :
               cat === 'medical' ? '医療' :
               cat === 'food' ? '食品' : 'その他'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="p-4 grid gap-3">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => {
            const isLow = item.quantity <= item.threshold;
            return (
              <div key={item.id} className={`bg-white p-4 rounded-xl shadow-sm border ${isLow ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-100'}`}>
                <div className="flex gap-3 mb-3">
                    {/* Image Section */}
                    <div 
                      onClick={() => handleImageClick(item.id)}
                      className="w-16 h-16 rounded-lg bg-gray-50 flex-shrink-0 flex items-center justify-center cursor-pointer border border-gray-200 overflow-hidden relative group"
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-gray-300" />
                      )}
                      {/* Overlay for hover */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      {!item.imageUrl && <div className="absolute bottom-0 w-full text-[8px] text-center text-gray-400 bg-gray-100">写真追加</div>}
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                                    {isLow && (
                                        <span className="flex items-center gap-0.5 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        <AlertTriangle className="w-3 h-3" /> 不足
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400">
                                {item.category === 'daily' ? '日用品' :
                                item.category === 'medical' ? '医療・衛生' :
                                item.category === 'food' ? '食品' : 'その他'}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className={`text-xl font-bold ${isLow ? 'text-red-600' : 'text-gray-800'}`}>
                                {item.quantity}
                                </span>
                                <span className="text-xs text-gray-500 ml-1">{item.unit}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
                  <button 
                    onClick={() => handleQuantityChange(item, -1)}
                    className="p-2 bg-white rounded shadow-sm hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                    disabled={item.quantity <= 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center gap-2">
                      {isLow ? (
                          <button 
                            onClick={() => toggleOrderStatus(item)}
                            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border ${item.isOrderRequested 
                                ? 'bg-green-50 border-green-200 text-green-600' 
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-100'}`}
                          >
                              {item.isOrderRequested ? (
                                  <><CheckCircle className="w-3 h-3" /> 発注済</>
                              ) : (
                                  <><XCircle className="w-3 h-3" /> 未発注</>
                              )}
                          </button>
                      ) : (
                         <span className="text-xs font-bold text-gray-400">在庫数変更</span>
                      )}

                      {/* Individual LINE share button */}
                      <button 
                        onClick={() => handleSingleItemShare(item)}
                        className="p-1.5 text-[#06C755] hover:bg-green-50 rounded-full"
                        title="この商品をLINEで発注依頼"
                      >
                          <MessageCircle className="w-4 h-4" />
                      </button>
                  </div>

                  <button 
                    onClick={() => handleQuantityChange(item, 1)}
                    className="p-2 bg-white rounded shadow-sm hover:bg-gray-100 text-green-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-gray-400">
            <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>該当する在庫がありません</p>
          </div>
        )}
      </div>
      
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Floating Action Button for LINE */}
      <div className="fixed bottom-20 right-4">
          <button 
            onClick={handleShareOrderList}
            className={`bg-[#06C755] hover:bg-[#05b34c] text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 relative ${pendingOrderCount === 0 ? 'opacity-80' : ''}`}
            title="不足リストをLINEで送る"
          >
              <MessageCircle className="w-6 h-6" />
              {pendingOrderCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                      {pendingOrderCount}
                  </span>
              )}
          </button>
      </div>
    </div>
  );
};

export default InventoryTab;
