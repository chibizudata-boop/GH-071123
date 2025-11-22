
import React, { useState } from 'react';
import { Room, Resident, Furniture } from '../types';
import { User, Box, Trash2, X, Plus, Droplets, Warehouse, Monitor, Key, Utensils } from 'lucide-react';

interface FacilityMapTabProps {
  rooms: Room[];
  residents: Resident[];
  onUpdateRoom: (room: Room) => void;
}

const FacilityMapTab: React.FC<FacilityMapTabProps> = ({ rooms, residents, onUpdateRoom }) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const handleAddFurniture = (furnitureName: string) => {
    if (!selectedRoom || !furnitureName.trim()) return;
    const newFurniture: Furniture = {
      id: Date.now().toString(),
      name: furnitureName,
    };
    const updatedRoom = {
      ...selectedRoom,
      furniture: [...selectedRoom.furniture, newFurniture]
    };
    onUpdateRoom(updatedRoom);
    setSelectedRoom(updatedRoom);
  };

  const handleDeleteFurniture = (furnitureId: string) => {
    if (!selectedRoom) return;
    const updatedRoom = {
      ...selectedRoom,
      furniture: selectedRoom.furniture.filter(f => f.id !== furnitureId)
    };
    onUpdateRoom(updatedRoom);
    setSelectedRoom(updatedRoom);
  };

  const getRoomStyle = (type: Room['type']) => {
    switch(type) {
      case 'PRIVATE': return 'bg-green-50 border-green-800 text-green-900';
      case 'OFFICE': return 'bg-orange-50 border-orange-800 text-orange-900';
      case 'SHARED': return 'bg-teal-50 border-teal-800 text-teal-900';
      case 'BATH': return 'bg-cyan-50 border-cyan-600 text-cyan-900';
      case 'TOILET': return 'bg-cyan-50 border-cyan-600 text-cyan-900';
      case 'STORAGE': return 'bg-gray-200 border-gray-600 text-gray-700';
      case 'ENTRANCE': return 'bg-yellow-50 border-yellow-700 text-yellow-900';
      case 'CORRIDOR': return 'bg-white border-transparent text-gray-400'; // No border for corridor to look open
      default: return 'bg-gray-100 border-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col pb-20">
      <div className="p-4 bg-white border-b border-gray-100 shadow-sm z-10">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <div className="bg-green-100 p-1.5 rounded">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
          </div>
          施設マップ・居室管理
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          部屋をタップして利用者情報や備品を確認・編集できます。
        </p>
      </div>

      <div className="flex-1 overflow-hidden bg-gray-100 flex items-center justify-center p-2">
        {/* Map Container */}
        <div className="relative w-full max-w-2xl aspect-[3/4] sm:aspect-square bg-white shadow-2xl border-4 border-gray-800 rounded-sm overflow-hidden">
          
          {/* Render Rooms */}
          {rooms.map(room => {
            const resident = residents.find(r => r.id === room.residentId);
            const isCorridor = room.type === 'CORRIDOR';
            
            return (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`absolute flex flex-col items-center justify-center p-1 border-2 transition-all hover:bg-opacity-80 hover:shadow-inner overflow-hidden ${getRoomStyle(room.type)}`}
                style={{
                  top: `${room.y}%`,
                  left: `${room.x}%`,
                  width: `${room.width}%`,
                  height: `${room.height}%`,
                  zIndex: isCorridor ? 0 : 10,
                }}
              >
                {/* Room Label */}
                {!isCorridor && (
                  <div className="font-bold text-[10px] sm:text-xs text-center leading-tight mb-1">
                    {room.name}
                  </div>
                )}
                {isCorridor && <span className="text-xs tracking-[1em] opacity-30">廊下</span>}

                {/* Specific Visuals based on room type */}
                
                {/* Private Room: Avatar */}
                {resident && (
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full ${resident.avatarColor} border border-white shadow-sm mb-0.5`} />
                    <span className="text-[8px] sm:text-[10px] font-bold truncate max-w-full px-1">{resident.name}</span>
                  </div>
                )}

                {/* Entrance: Washbasin */}
                {room.type === 'ENTRANCE' && (
                  <div className="flex items-center gap-1 mt-1 opacity-70">
                     <div className="flex flex-col items-center">
                       <Droplets className="w-3 h-3 text-blue-500" />
                       <span className="text-[8px]">洗面</span>
                     </div>
                  </div>
                )}

                {/* Dining: 4 chairs icon */}
                {room.type === 'SHARED' && (
                   <div className="grid grid-cols-2 gap-0.5 opacity-50 mt-1">
                     <div className="w-2 h-2 border border-gray-600 rounded-[1px]"></div>
                     <div className="w-2 h-2 border border-gray-600 rounded-[1px]"></div>
                     <div className="w-2 h-2 border border-gray-600 rounded-[1px]"></div>
                     <div className="w-2 h-2 border border-gray-600 rounded-[1px]"></div>
                   </div>
                )}

                {/* Office: PC icon */}
                {room.type === 'OFFICE' && <Monitor className="w-4 h-4 opacity-30" />}

                {/* Storage: Box icon */}
                {room.type === 'STORAGE' && <Warehouse className="w-4 h-4 opacity-30" />}

              </button>
            );
          })}
        </div>
      </div>

      {/* Room Detail Modal */}
      {selectedRoom && (
        <RoomDetailModal 
          room={selectedRoom} 
          resident={residents.find(r => r.id === selectedRoom.residentId)}
          onClose={() => setSelectedRoom(null)}
          onAddFurniture={handleAddFurniture}
          onDeleteFurniture={handleDeleteFurniture}
        />
      )}
    </div>
  );
};

const RoomDetailModal: React.FC<{
  room: Room;
  resident?: Resident;
  onClose: () => void;
  onAddFurniture: (name: string) => void;
  onDeleteFurniture: (id: string) => void;
}> = ({ room, resident, onClose, onAddFurniture, onDeleteFurniture }) => {
  const [newItemName, setNewItemName] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col animate-slideUp max-h-[80vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <div>
            <h3 className="font-bold text-lg text-gray-800">{room.name}</h3>
            <p className="text-xs text-gray-500">
              {room.type === 'PRIVATE' ? '個室・専用部' : 
               room.type === 'SHARED' ? '食堂・共用部' :
               room.type === 'OFFICE' ? '事務室' :
               room.type === 'ENTRANCE' ? '玄関' :
               room.type === 'STORAGE' ? '物置' : 'その他'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          {/* Resident Info */}
          {room.type === 'PRIVATE' && (
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <h4 className="text-xs font-bold text-green-600 uppercase mb-2 flex items-center gap-1">
                <User className="w-4 h-4" /> 利用者情報
              </h4>
              {resident ? (
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${resident.avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>
                    {resident.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{resident.name} 様</p>
                    <p className="text-xs text-gray-500">{resident.age}歳 / {resident.disabilityLevel}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">空室</p>
              )}
            </div>
          )}

          {/* Furniture List */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Box className="w-4 h-4 text-orange-500" />
              備品・設備リスト
            </h4>
            
            <div className="space-y-2 mb-4">
              {room.furniture.length > 0 ? (
                room.furniture.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <button 
                      onClick={() => onDeleteFurniture(item.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic text-center py-4">登録された備品はありません</p>
              )}
            </div>

            {/* Add New Item */}
            <div className="flex gap-2">
              <input 
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="新しい備品名 (例: 加湿器)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && (onAddFurniture(newItemName), setNewItemName(''))}
              />
              <button 
                onClick={() => { onAddFurniture(newItemName); setNewItemName(''); }}
                disabled={!newItemName.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityMapTab;
