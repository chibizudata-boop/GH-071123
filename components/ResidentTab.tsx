
import React, { useState, useRef, useEffect } from 'react';
import { Resident, StoredFile, Album, HealthRecord } from '../types';
import { User, FileText, HeartPulse, X, FolderOpen, File as FileIcon, Image, Plus, Calendar, Edit2, Save, ArrowRight, Upload, Activity, Scale } from 'lucide-react';
import PhotoAlbum from './PhotoAlbum';

interface ResidentTabProps {
  residents: Resident[];
  onUpdateResident: (resident: Resident) => void;
  selectedResident: Resident | null;
  onSelectResident: (resident: Resident | null) => void;
  onViewSchedule: (residentId: string) => void;
}

const ResidentTab: React.FC<ResidentTabProps> = ({ residents, onUpdateResident, selectedResident, onSelectResident, onViewSchedule }) => {
  
  // Local state simulation for resident updates
  const [localResidents, setLocalResidents] = useState(residents);

  // Sync props to local state
  useEffect(() => {
    setLocalResidents(residents);
  }, [residents]);

  const updateResidentFiles = (residentId: string, newFile: StoredFile) => {
    setLocalResidents(prev => prev.map(r => {
      if (r.id === residentId) {
        return { ...r, files: [newFile, ...r.files] };
      }
      return r;
    }));
    if (selectedResident && selectedResident.id === residentId) {
      onSelectResident(selectedResident ? { ...selectedResident, files: [newFile, ...selectedResident.files] } : null);
    }
  };
  
  const updateResidentFileDetails = (residentId: string, updatedFile: StoredFile) => {
    setLocalResidents(prev => prev.map(r => {
      if (r.id === residentId) {
        return { ...r, files: r.files.map(f => f.id === updatedFile.id ? updatedFile : f) };
      }
      return r;
    }));
    if (selectedResident && selectedResident.id === residentId) {
       onSelectResident(selectedResident ? { ...selectedResident, files: selectedResident.files.map(f => f.id === updatedFile.id ? updatedFile : f) } : null);
    }
  };

  const deleteResidentFile = (residentId: string, fileId: string) => {
     setLocalResidents(prev => prev.map(r => {
      if (r.id === residentId) {
        return { ...r, files: r.files.filter(f => f.id !== fileId) };
      }
      return r;
    }));
    if (selectedResident && selectedResident.id === residentId) {
      onSelectResident(selectedResident ? { ...selectedResident, files: selectedResident.files.filter(f => f.id !== fileId) } : null);
    }
  };

  const addResidentAlbum = (residentId: string, album: Album) => {
    setLocalResidents(prev => prev.map(r => {
      if (r.id === residentId) {
        return { ...r, albums: [...(r.albums || []), album] };
      }
      return r;
    }));
    if (selectedResident && selectedResident.id === residentId) {
      onSelectResident(selectedResident ? { ...selectedResident, albums: [...(selectedResident.albums || []), album] } : null);
    }
  };

  const handleProfileUpdate = (updatedResident: Resident) => {
    onUpdateResident(updatedResident);
    onSelectResident(updatedResident); // Keep modal open with new data
  };

  const currentResident = selectedResident ? localResidents.find(r => r.id === selectedResident.id) : null;

  return (
    <div className="pb-20">
      <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">入居者一覧 ({localResidents.length}名)</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {localResidents.map((resident) => (
          <div 
            key={resident.id} 
            onClick={() => onSelectResident(resident)}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`w-12 h-12 ${resident.avatarColor} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm`}>
                {resident.name[0]}
              </div>
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                Rm.{resident.roomNumber}
              </span>
            </div>
            <h3 className="font-bold text-gray-800">{resident.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{resident.age}歳 / {resident.disabilityLevel}</p>
            <div className="mt-3 flex gap-1 flex-wrap">
               <span className="text-[10px] border border-gray-200 px-1.5 py-0.5 rounded bg-gray-50 text-gray-600">アセスメント有</span>
               {(resident.files.length > 0) && (
                 <span className="text-[10px] border border-green-200 px-1.5 py-0.5 rounded bg-green-50 text-green-600 flex items-center gap-0.5">
                   <Image className="w-2 h-2" /> 写真・他
                 </span>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Resident Detail Modal */}
      {currentResident && (
        <ResidentDetailModal 
          resident={currentResident} 
          onClose={() => onSelectResident(null)}
          onUpdateResident={handleProfileUpdate}
          onAddFile={(file) => updateResidentFiles(currentResident.id, file)}
          onUpdateFile={(file) => updateResidentFileDetails(currentResident.id, file)}
          onDeleteFile={(fileId) => deleteResidentFile(currentResident.id, fileId)}
          onAddAlbum={(album) => addResidentAlbum(currentResident.id, album)}
          onViewSchedule={() => onViewSchedule(currentResident.id)}
        />
      )}
    </div>
  );
};

// --- Graph Components ---

const SimpleLineChart: React.FC<{ 
  data: { x: string, y: number }[], 
  color: string, 
  minY?: number, 
  maxY?: number,
  label: string
}> = ({ data, color, minY, maxY, label }) => {
  if (data.length === 0) return <div className="text-xs text-gray-400 text-center py-8">データなし</div>;

  const values = data.map(d => d.y);
  const min = minY ?? Math.min(...values) * 0.95;
  const max = maxY ?? Math.max(...values) * 1.05;
  const range = max - min || 1;

  const getX = (index: number) => (index / (data.length - 1 || 1)) * 100;
  const getY = (value: number) => 100 - ((value - min) / range) * 100;

  const points = data.map((d, i) => `${getX(i)},${getY(d.y)}`).join(' ');

  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
         <span>{label}</span>
         <span>Max: {Math.max(...values).toFixed(1)}</span>
      </div>
      <div className="relative h-32 w-full bg-gray-50 rounded border border-gray-100 overflow-hidden">
        {/* Grid Lines */}
        <div className="absolute top-[25%] w-full h-px bg-gray-200 border-dashed"></div>
        <div className="absolute top-[50%] w-full h-px bg-gray-200 border-dashed"></div>
        <div className="absolute top-[75%] w-full h-px bg-gray-200 border-dashed"></div>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
            vectorEffect="non-scaling-stroke"
          />
          {data.map((d, i) => (
             <circle 
               key={i} 
               cx={getX(i)} 
               cy={getY(d.y)} 
               r="3" 
               fill="white" 
               stroke={color} 
               strokeWidth="1.5"
               vectorEffect="non-scaling-stroke" 
             />
          ))}
        </svg>
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
         <span>{data[0].x}</span>
         <span>{data[data.length - 1].x}</span>
      </div>
    </div>
  );
};

const HealthGraphSection: React.FC<{ records: HealthRecord[] }> = ({ records }) => {
  const [viewMode, setViewMode] = useState<'DAY' | 'WEEK' | 'MONTH'>('WEEK');
  
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Filter based on viewMode
  const filterDate = new Date();
  if (viewMode === 'DAY') filterDate.setDate(filterDate.getDate() - 1); // Last 24h theoretically, but records are daily
  if (viewMode === 'WEEK') filterDate.setDate(filterDate.getDate() - 7);
  if (viewMode === 'MONTH') filterDate.setDate(filterDate.getDate() - 30);

  const displayRecords = sortedRecords.filter(r => new Date(r.date) >= filterDate);

  const prepareData = (key: keyof HealthRecord) => {
    return displayRecords
      .filter(r => r[key] !== undefined)
      .map(r => ({ x: r.date.slice(5).replace('-', '/'), y: Number(r[key]) }));
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-6">
       <div className="flex items-center justify-between mb-2">
         <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-500" /> バイタルサイン
         </h4>
         <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['DAY', 'WEEK', 'MONTH'] as const).map(m => (
               <button 
                 key={m}
                 onClick={() => setViewMode(m)}
                 className={`px-2 py-1 text-xs font-bold rounded transition-all ${viewMode === m ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
               >
                 {m === 'DAY' ? '日' : m === 'WEEK' ? '週' : '月'}
               </button>
            ))}
         </div>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SimpleLineChart data={prepareData('temperature')} color="#ef4444" label="体温 (℃)" minY={35} maxY={39} />
          <SimpleLineChart data={prepareData('systolicBP')} color="#059669" label="収縮期血圧 (mmHg)" minY={90} maxY={180} />
          <SimpleLineChart data={prepareData('pulse')} color="#10b981" label="脈拍 (bpm)" minY={50} maxY={120} />
          <SimpleLineChart data={prepareData('spo2')} color="#06b6d4" label="SPO2 (%)" minY={90} maxY={100} />
       </div>
    </div>
  );
};

const WeightGraphSection: React.FC<{ records: HealthRecord[] }> = ({ records }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [viewMode, setViewMode] = useState<'MONTH' | 'YEAR'>('YEAR');

  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const displayRecords = sortedRecords.filter(r => {
    const d = new Date(r.date);
    if (viewMode === 'MONTH') {
        return d.getFullYear() === year && (d.getMonth() + 1) === month;
    } else {
        // Last 12 months or specific year? Let's do specific year for simplicity
        return d.getFullYear() === year;
    }
  });

  const weightData = displayRecords
    .filter(r => r.weight !== undefined)
    .map(r => ({ x: r.date.slice(5).replace('-', '/'), y: r.weight as number }));

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
       <div className="flex items-center justify-between mb-4">
         <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Scale className="w-4 h-4 text-green-500" /> 体重推移
         </h4>
         <div className="flex gap-2">
            <select 
              value={year} 
              onChange={(e) => setYear(Number(e.target.value))}
              className="text-xs bg-gray-50 border border-gray-200 rounded p-1"
            >
               <option value={2022}>2022年</option>
               <option value={2023}>2023年</option>
               <option value={2024}>2024年</option>
            </select>
            {viewMode === 'MONTH' && (
                <select 
                value={month} 
                onChange={(e) => setMonth(Number(e.target.value))}
                className="text-xs bg-gray-50 border border-gray-200 rounded p-1"
                >
                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{m}月</option>
                ))}
                </select>
            )}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button 
                    onClick={() => setViewMode('MONTH')} 
                    className={`px-2 py-0.5 text-xs font-bold rounded ${viewMode === 'MONTH' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
                >月</button>
                <button 
                    onClick={() => setViewMode('YEAR')} 
                    className={`px-2 py-0.5 text-xs font-bold rounded ${viewMode === 'YEAR' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
                >年</button>
            </div>
         </div>
       </div>
       
       <SimpleLineChart data={weightData} color="#059669" label="体重 (kg)" minY={30} maxY={100} />
    </div>
  );
};

// --- Main Component ---

const ResidentDetailModal: React.FC<{ 
  resident: Resident; 
  onClose: () => void;
  onUpdateResident: (resident: Resident) => void;
  onAddFile: (file: StoredFile) => void;
  onUpdateFile: (file: StoredFile) => void;
  onDeleteFile: (fileId: string) => void;
  onAddAlbum: (album: Album) => void;
  onViewSchedule: () => void;
}> = ({ resident, onClose, onUpdateResident, onAddFile, onUpdateFile, onDeleteFile, onAddAlbum, onViewSchedule }) => {
  const [activeTab, setActiveTab] = useState<'INFO' | 'FILES' | 'HEALTH'>('INFO');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Resident>(resident);
  
  // State for adding new health record
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [newRecordData, setNewRecordData] = useState<Partial<HealthRecord>>({
    weight: undefined,
    temperature: undefined,
    systolicBP: undefined,
    diastolicBP: undefined,
    pulse: undefined,
    spo2: undefined
  });
  
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditFormData(resident);
  }, [resident]);

  // Separate non-image files for "Documents" list if needed
  const documents = resident.files.filter(f => f.type !== 'image' && f.type !== 'video');

  const handleSave = () => {
    onUpdateResident(editFormData);
    setIsEditing(false);
  };
  
  const handleAddHealthRecord = () => {
    const today = new Date();
    const record: HealthRecord = {
        id: Date.now().toString(),
        date: today.toISOString().split('T')[0],
        time: today.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        ...newRecordData
    };
    
    const updatedRecords = [...(resident.healthRecords || []), record];
    // Update weight on profile if new weight provided
    const updatedResident = {
        ...resident,
        healthRecords: updatedRecords,
        currentWeight: newRecordData.weight || resident.currentWeight
    };
    
    onUpdateResident(updatedResident);
    setIsAddingRecord(false);
    setNewRecordData({}); // Reset
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload
      const type = file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.xlsx') ? 'excel' : 'other';
      const newFile: StoredFile = {
        id: Date.now().toString(),
        name: file.name,
        type: type,
        url: '#',
        date: new Date().toISOString().split('T')[0],
        description: 'アップロードされた書類'
      };
      onAddFile(newFile);
    }
    if (docInputRef.current) docInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[90vh] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col animate-slideUp sm:animate-fadeIn overflow-hidden">
        
        {/* Header */}
        <div className={`relative p-6 ${resident.avatarColor} text-white transition-all duration-300 flex-shrink-0`}>
          <div className="absolute top-4 right-4 flex gap-2">
            {activeTab === 'INFO' && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md transition-colors"
                title="情報を編集"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-3xl font-bold border-2 border-white/30 shadow-inner">
              {resident.name[0]}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input 
                    type="text" 
                    value={editFormData.name} 
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className="text-lg font-bold text-gray-800 w-full px-2 py-1 rounded border border-white/50 bg-white/90"
                    placeholder="氏名"
                  />
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={editFormData.roomNumber} 
                      onChange={(e) => setEditFormData({...editFormData, roomNumber: e.target.value})}
                      className="text-sm text-gray-800 w-20 px-2 py-1 rounded border border-white/50 bg-white/90"
                      placeholder="号室"
                    />
                     <input 
                      type="number" 
                      value={editFormData.age} 
                      onChange={(e) => setEditFormData({...editFormData, age: parseInt(e.target.value)})}
                      className="text-sm text-gray-800 w-16 px-2 py-1 rounded border border-white/50 bg-white/90"
                      placeholder="年齢"
                    />
                  </div>
                   <input 
                      type="text" 
                      value={editFormData.disabilityLevel} 
                      onChange={(e) => setEditFormData({...editFormData, disabilityLevel: e.target.value})}
                      className="text-xs text-gray-800 w-full px-2 py-1 rounded border border-white/50 bg-white/90"
                      placeholder="障害区分 (例: 区分4)"
                    />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-mono backdrop-blur-md border border-white/10">
                      Rm.{resident.roomNumber}
                    </span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs backdrop-blur-md border border-white/10">
                      {resident.disabilityLevel}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">{resident.name}</h2>
                  <p className="text-white/90 text-sm">{resident.age}歳 {resident.diagnosis ? `/ ${resident.diagnosis}` : ''}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 flex-shrink-0">
          <button 
            onClick={() => setActiveTab('INFO')}
            disabled={isEditing}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'INFO' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <User className="w-4 h-4" /> 基本情報
          </button>
          <button 
             onClick={() => setActiveTab('HEALTH')}
             disabled={isEditing}
             className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'HEALTH' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
             <Activity className="w-4 h-4" /> 健康・バイタル
          </button>
          <button 
             onClick={() => setActiveTab('FILES')}
             disabled={isEditing}
             className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'FILES' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FolderOpen className="w-4 h-4" /> アルバム
            {resident.files.length > 0 && <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{resident.files.length}</span>}
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          {activeTab === 'INFO' ? (
            <div className="space-y-6">
              {isEditing && (
                <div className="flex gap-3 mb-4">
                   <button 
                     onClick={handleSave} 
                     className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-green-700"
                   >
                     <Save className="w-4 h-4" /> 保存
                   </button>
                   <button 
                     onClick={() => { setIsEditing(false); setEditFormData(resident); }}
                     className="flex-1 bg-white border border-gray-300 text-gray-600 py-2 rounded-lg font-bold shadow-sm hover:bg-gray-50"
                   >
                     キャンセル
                   </button>
                </div>
              )}

              {/* Go to Schedule Button */}
              {!isEditing && (
                  <button 
                    onClick={onViewSchedule}
                    className="w-full bg-white border border-green-200 text-green-600 py-3 rounded-xl shadow-sm font-bold flex items-center justify-center gap-2 hover:bg-green-50 transition-colors"
                  >
                      <Calendar className="w-4 h-4" />
                      予定表を確認する
                      <ArrowRight className="w-4 h-4 ml-auto" />
                  </button>
              )}
              
              {/* Extended Profile Fields */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                 <h4 className="flex items-center gap-2 text-gray-600 font-bold mb-4 text-sm uppercase tracking-wider">
                   <User className="w-4 h-4" /> プロフィール詳細
                 </h4>
                 
                 <div className="grid grid-cols-2 gap-4">
                    {/* Diagnosis */}
                    <div className="col-span-2">
                       <label className="text-xs text-gray-400 font-bold block mb-1">障害名・診断名</label>
                       {isEditing ? (
                          <input 
                            type="text" 
                            value={editFormData.diagnosis || ''}
                            onChange={(e) => setEditFormData({...editFormData, diagnosis: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            placeholder="診断名を入力"
                          />
                       ) : (
                          <p className="text-sm font-bold text-gray-800">{resident.diagnosis || '-'}</p>
                       )}
                    </div>

                    {/* Birth Date */}
                    <div>
                       <label className="text-xs text-gray-400 font-bold block mb-1">生年月日</label>
                       {isEditing ? (
                          <input 
                            type="date" 
                            value={editFormData.birthDate || ''}
                            onChange={(e) => setEditFormData({...editFormData, birthDate: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                          />
                       ) : (
                          <p className="text-sm font-bold text-gray-800">{resident.birthDate || '-'}</p>
                       )}
                    </div>

                    {/* Blood Type */}
                    <div>
                       <label className="text-xs text-gray-400 font-bold block mb-1">血液型</label>
                       {isEditing ? (
                          <select 
                            value={editFormData.bloodType || ''}
                            onChange={(e) => setEditFormData({...editFormData, bloodType: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                          >
                            <option value="">未設定</option>
                            <option value="A">A型</option>
                            <option value="B">B型</option>
                            <option value="O">O型</option>
                            <option value="AB">AB型</option>
                          </select>
                       ) : (
                          <p className="text-sm font-bold text-gray-800">{resident.bloodType ? `${resident.bloodType}型` : '-'}</p>
                       )}
                    </div>

                    {/* Weight */}
                    <div>
                       <label className="text-xs text-gray-400 font-bold block mb-1">体重 (kg)</label>
                       {isEditing ? (
                          <input 
                            type="number" 
                            step="0.1"
                            value={editFormData.currentWeight || ''}
                            onChange={(e) => setEditFormData({...editFormData, currentWeight: parseFloat(e.target.value)})}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            placeholder="0.0"
                          />
                       ) : (
                          <p className="text-sm font-bold text-gray-800">{resident.currentWeight ? `${resident.currentWeight} kg` : '-'}</p>
                       )}
                    </div>
                 </div>
              </div>

              <div className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 ${isEditing ? 'ring-2 ring-orange-100' : ''}`}>
                <h4 className="flex items-center gap-2 text-orange-600 font-bold mb-3 text-sm uppercase tracking-wider">
                  <HeartPulse className="w-4 h-4" />
                  アセスメント・特性
                </h4>
                {isEditing ? (
                  <textarea 
                    value={editFormData.assessment}
                    onChange={(e) => setEditFormData({...editFormData, assessment: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    rows={5}
                  />
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {resident.assessment}
                  </p>
                )}
              </div>

              <div className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 ${isEditing ? 'ring-2 ring-green-100' : ''}`}>
                <h4 className="flex items-center gap-2 text-green-600 font-bold mb-3 text-sm uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  個別支援計画（概要）
                </h4>
                 {isEditing ? (
                  <textarea 
                    value={editFormData.carePlan}
                    onChange={(e) => setEditFormData({...editFormData, carePlan: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    rows={5}
                  />
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {resident.carePlan}
                  </p>
                )}
              </div>
              
              {/* Document List (PDF/Excel) with Upload Feature */}
              {!isEditing && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                   <div className="flex justify-between items-center mb-3">
                     <h4 className="flex items-center gap-2 text-gray-600 font-bold text-sm uppercase tracking-wider">
                      <FileText className="w-4 h-4" />
                      関連書類・アセスメントシート
                    </h4>
                    <button 
                      onClick={() => docInputRef.current?.click()}
                      className="text-xs flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 font-bold"
                    >
                      <Upload className="w-3 h-3" /> 書類追加
                    </button>
                    <input 
                      type="file" 
                      ref={docInputRef} 
                      className="hidden" 
                      accept=".pdf,.xlsx,.xls,.doc,.docx"
                      onChange={handleDocumentUpload}
                    />
                   </div>
                   
                  <div className="space-y-2">
                    {documents.length > 0 ? (
                      documents.map(doc => (
                        <div key={doc.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                           <FileIcon className="w-4 h-4 text-gray-400" />
                           <div className="flex-1 min-w-0">
                             <p className="text-sm text-gray-700 truncate font-medium">{doc.name}</p>
                             {doc.description && <p className="text-[10px] text-gray-400 truncate">{doc.description}</p>}
                           </div>
                           <span className="text-xs text-gray-400 whitespace-nowrap">{doc.date}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-xs text-gray-400 py-2">登録された書類はありません</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'HEALTH' ? (
            <div className="space-y-6">
                {/* Add Record Button */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                   {!isAddingRecord ? (
                       <button 
                         onClick={() => setIsAddingRecord(true)}
                         className="w-full py-2 bg-green-600 text-white rounded-lg font-bold shadow-sm hover:bg-green-700 flex items-center justify-center gap-2"
                       >
                          <Plus className="w-4 h-4" /> 記録を追加
                       </button>
                   ) : (
                       <div className="space-y-4 animate-fadeIn">
                          <div className="flex justify-between items-center">
                             <h4 className="font-bold text-gray-700 text-sm">新規バイタル記録</h4>
                             <button onClick={() => setIsAddingRecord(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">体温 (℃)</label>
                                <input 
                                   type="number" step="0.1" placeholder="36.5"
                                   className="w-full border border-gray-300 rounded p-2 text-sm"
                                   value={newRecordData.temperature || ''}
                                   onChange={e => setNewRecordData({...newRecordData, temperature: parseFloat(e.target.value)})}
                                />
                             </div>
                             <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">体重 (kg)</label>
                                <input 
                                   type="number" step="0.1" placeholder="0.0"
                                   className="w-full border border-gray-300 rounded p-2 text-sm"
                                   value={newRecordData.weight || ''}
                                   onChange={e => setNewRecordData({...newRecordData, weight: parseFloat(e.target.value)})}
                                />
                             </div>
                             <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">血圧 (上/下)</label>
                                <div className="flex gap-1 items-center">
                                   <input 
                                      type="number" placeholder="120"
                                      className="w-full border border-gray-300 rounded p-2 text-sm"
                                      value={newRecordData.systolicBP || ''}
                                      onChange={e => setNewRecordData({...newRecordData, systolicBP: parseFloat(e.target.value)})}
                                   />
                                   <span className="text-gray-400">/</span>
                                   <input 
                                      type="number" placeholder="80"
                                      className="w-full border border-gray-300 rounded p-2 text-sm"
                                      value={newRecordData.diastolicBP || ''}
                                      onChange={e => setNewRecordData({...newRecordData, diastolicBP: parseFloat(e.target.value)})}
                                   />
                                </div>
                             </div>
                             <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">脈拍 / SPO2</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" placeholder="70"
                                        className="w-full border border-gray-300 rounded p-2 text-sm"
                                        value={newRecordData.pulse || ''}
                                        onChange={e => setNewRecordData({...newRecordData, pulse: parseFloat(e.target.value)})}
                                    />
                                    <input 
                                        type="number" placeholder="98"
                                        className="w-full border border-gray-300 rounded p-2 text-sm"
                                        value={newRecordData.spo2 || ''}
                                        onChange={e => setNewRecordData({...newRecordData, spo2: parseFloat(e.target.value)})}
                                    />
                                </div>
                             </div>
                          </div>
                          <button 
                             onClick={handleAddHealthRecord}
                             className="w-full py-2 bg-green-600 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-green-700"
                          >
                             保存する
                          </button>
                       </div>
                   )}
                </div>

                <WeightGraphSection records={resident.healthRecords || []} />
                <HealthGraphSection records={resident.healthRecords || []} />
            </div>
          ) : (
            <div className="space-y-6">
               <PhotoAlbum 
                 resident={resident}
                 files={resident.files}
                 albums={resident.albums || []}
                 onUpdateFile={onUpdateFile}
                 onDeleteFile={onDeleteFile}
                 onAddFile={onAddFile}
                 onAddAlbum={onAddAlbum}
               />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentTab;
