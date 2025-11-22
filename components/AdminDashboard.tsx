
import React, { useState } from 'react';
import { Resident, Staff } from '../types';
import { Users, UserPlus, ArrowLeft, Save, Trash2, Edit2, Plus } from 'lucide-react';

interface AdminDashboardProps {
  residents: Resident[];
  staffMembers: Staff[];
  onClose: () => void;
  onUpdateResidents: (newResidents: Resident[]) => void;
  onUpdateStaff: (newStaff: Staff[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  residents, 
  staffMembers, 
  onClose,
  onUpdateResidents,
  onUpdateStaff
}) => {
  const [activeTab, setActiveTab] = useState<'RESIDENTS' | 'STAFF'>('RESIDENTS');
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  
  // Simple mock handlers for demonstration
  const handleDeleteResident = (id: string) => {
    if (window.confirm('この利用者を削除しますか？')) {
      onUpdateResidents(residents.filter(r => r.id !== id));
    }
  };

  const handleDeleteStaff = (id: string) => {
    if (window.confirm('このスタッフを削除しますか？')) {
      onUpdateStaff(staffMembers.filter(s => s.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-green-900 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">アプリ編集・管理</h1>
          </div>
          <span className="text-xs bg-green-800 px-2 py-1 rounded border border-green-600">管理者モード</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 pb-20">
        <p className="text-sm text-gray-500 mb-4 bg-white p-3 rounded-lg border border-gray-200">
          ここではアプリに表示される利用者情報やスタッフリストを編集できます。
          変更は即座に全スタッフのアプリに反映されます。
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setActiveTab('RESIDENTS')}
            className={`flex-1 py-3 rounded-xl font-bold shadow-sm transition-all ${activeTab === 'RESIDENTS' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}
          >
            利用者設定
          </button>
          <button 
            onClick={() => setActiveTab('STAFF')}
            className={`flex-1 py-3 rounded-xl font-bold shadow-sm transition-all ${activeTab === 'STAFF' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}
          >
            スタッフ設定
          </button>
        </div>

        {activeTab === 'RESIDENTS' && (
          <div className="space-y-4">
             <div className="flex justify-between items-center mb-2">
               <h2 className="font-bold text-gray-700">登録利用者一覧 ({residents.length}名)</h2>
               <button className="text-xs bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-green-700">
                 <Plus className="w-4 h-4" /> 新規追加
               </button>
             </div>

             {residents.map(resident => (
               <div key={resident.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className={`w-12 h-12 ${resident.avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>
                     {resident.name[0]}
                   </div>
                   <div>
                     <div className="flex items-center gap-2">
                       <h3 className="font-bold text-gray-800">{resident.name}</h3>
                       <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-mono">{resident.roomNumber}</span>
                     </div>
                     <p className="text-xs text-gray-400">{resident.disabilityLevel} / {resident.age}歳</p>
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><Edit2 className="w-4 h-4" /></button>
                   <button onClick={() => handleDeleteResident(resident.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4" /></button>
                 </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'STAFF' && (
          <div className="space-y-4">
             <div className="flex justify-between items-center mb-2">
               <h2 className="font-bold text-gray-700">登録スタッフ一覧 ({staffMembers.length}名)</h2>
               <button className="text-xs bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-green-700">
                 <UserPlus className="w-4 h-4" /> スタッフ招待
               </button>
             </div>

             {staffMembers.map(staff => (
               <div key={staff.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${staff.role === 'manager' ? 'bg-purple-500' : 'bg-gray-400'}`}>
                     {staff.name[0]}
                   </div>
                   <div>
                     <h3 className="font-bold text-gray-800">{staff.name}</h3>
                     <span className="text-xs text-gray-500 flex items-center gap-1">
                       ID: {staff.loginId || '未設定'} • 
                       <span className={`px-1.5 py-0.5 rounded ${staff.role === 'manager' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100'}`}>{staff.role}</span>
                     </span>
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><Edit2 className="w-4 h-4" /></button>
                   {staff.role !== 'manager' && (
                      <button onClick={() => handleDeleteStaff(staff.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4" /></button>
                   )}
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
