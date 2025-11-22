
import React, { useState, useRef } from 'react';
import { Task, TaskCategory, TaskPriority } from '../types';
import { CATEGORY_CONFIG, RESIDENTS } from '../constants';
import { X, Camera, Sparkles, Loader2, User } from 'lucide-react';
import { generateTaskInstructions, analyzeImageForLog } from '../services/geminiService';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, 'id' | 'isCompleted'>) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [aiInstructions, setAiInstructions] = useState('');
  const [category, setCategory] = useState<TaskCategory>(TaskCategory.OTHER);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [residentId, setResidentId] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        
        // Auto-analyze image
        setIsAiLoading(true);
        try {
          const analysis = await analyzeImageForLog(base64);
          setDescription(prev => prev ? `${prev}\n\n【AI画像解析】\n${analysis}` : `【AI画像解析】\n${analysis}`);
        } finally {
          setIsAiLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiSuggest = async () => {
    if (!title || !time) return;
    setIsAiLoading(true);
    try {
      let residentContext = "";
      if (residentId) {
        const r = RESIDENTS.find(res => res.id === residentId);
        if (r) {
          residentContext = `Name: ${r.name}, Assessment/Needs: ${r.assessment}`;
        }
      }

      const instructions = await generateTaskInstructions(title, time, residentContext);
      setAiInstructions(instructions);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      title,
      time,
      description,
      category,
      priority,
      imageUrl: imagePreview || undefined,
      residentId: residentId || undefined,
      aiGeneratedInstructions: aiInstructions || undefined
    });
    // Reset form
    setTitle('');
    setTime('');
    setDescription('');
    setAiInstructions('');
    setImagePreview(null);
    setResidentId('');
    onClose();
  };

  const selectedResident = residentId ? RESIDENTS.find(r => r.id === residentId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">新規タスク作成</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Time & Title */}
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">時間</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">業務名</label>
              <input
                type="text"
                required
                placeholder="例: 昼食後の服薬"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
          </div>

          {/* Resident Selection */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">対象利用者 (任意)</label>
             <div className="relative">
               <select
                value={residentId}
                onChange={(e) => setResidentId(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2.5 pl-10 focus:ring-2 focus:ring-green-500 outline-none appearance-none"
               >
                 <option value="">指定なし（全体業務など）</option>
                 {RESIDENTS.map(r => (
                   <option key={r.id} value={r.id}>{r.roomNumber}号室 - {r.name}</option>
                 ))}
               </select>
               <User className="w-5 h-5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
             </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
              >
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">重要度</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value={TaskPriority.LOW}>低</option>
                <option value={TaskPriority.MEDIUM}>中</option>
                <option value={TaskPriority.HIGH}>高</option>
                <option value={TaskPriority.URGENT}>緊急</option>
              </select>
            </div>
          </div>

          {/* Manual Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ・備考</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="補足事項があれば入力..."
              className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
            />
          </div>

          {/* AI Instructions Section */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5 text-green-800 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>AI サポート手順</span>
              </div>
              <button
                type="button"
                disabled={!title || isAiLoading}
                onClick={handleAiSuggest}
                className="text-xs bg-white border border-green-200 text-green-600 px-3 py-1.5 rounded-full font-bold shadow-sm hover:bg-green-50 disabled:opacity-50 transition-all flex items-center gap-1"
              >
                {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {aiInstructions ? '再生成' : (selectedResident ? '利用者の特性に合わせて生成' : '手順を自動生成')}
              </button>
            </div>
            
            {aiInstructions ? (
              <textarea
                rows={4}
                value={aiInstructions}
                onChange={(e) => setAiInstructions(e.target.value)}
                className="w-full bg-white rounded-lg border border-green-200 p-3 text-sm text-green-900 focus:ring-2 focus:ring-green-500 outline-none"
              />
            ) : (
              <div className="text-center py-4 text-green-400 text-xs">
                <p>「{selectedResident ? `${selectedResident.name}様の` : ''}業務名」から適切な手順を提案します。</p>
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">画像添付 (持ち物・記録など)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {imagePreview ? (
                <div className="relative w-full">
                  <img src={imagePreview} alt="Preview" className="h-40 w-full object-contain rounded-lg" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium text-sm">画像を変更</span>
                  </div>
                </div>
              ) : (
                <>
                  <Camera className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">クリックして写真を撮影/アップロード</span>
                  <span className="text-xs text-gray-400 mt-1">※AIが内容を解析しメモに追加します</span>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>
             {isAiLoading && imagePreview && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> AIが画像を解析中...
                </p>
              )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-green-600 text-white font-bold shadow-lg hover:bg-green-700 active:scale-95 transition-all"
            >
              タスク追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
