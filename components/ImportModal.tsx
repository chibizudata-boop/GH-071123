import React, { useState, useRef } from 'react';
import { X, FileSpreadsheet, Image, FileText, Upload, Loader2, CheckCircle, CalendarDays, Camera } from 'lucide-react';
import { parseShiftImage } from '../services/geminiService';
import { Staff, Shift } from '../types';
import { STAFF_MEMBERS } from '../constants'; // Or pass as props

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSchedule: (fileName: string, type?: 'STAFF_SHIFT' | 'RESIDENT_SCHEDULE', parsedData?: Shift[]) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportSchedule }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completeMsg, setCompleteMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const findStaffIdByName = (name: string): string | undefined => {
    if (!name) return undefined;
    // Simple fuzzy match: check if staff name includes the parsed name or vice versa
    const match = STAFF_MEMBERS.find(s => s.name.includes(name) || name.includes(s.name.split(' ')[0]));
    return match?.id;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setCompleteMsg(null);

    try {
      if (file.name.includes('利用予定') || file.name.includes('通所')) {
        // Mock processing for resident schedule
        setTimeout(() => {
          onImportSchedule(file.name, 'RESIDENT_SCHEDULE');
          setCompleteMsg(`${file.name} から利用者の予定表を読み込みました`);
          setIsProcessing(false);
        }, 1500);

      } else if (file.type.startsWith('image/') && (file.name.includes('シフト') || file.name.includes('shift'))) {
        // Real AI Processing for Shifts
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          try {
             const parsedData = await parseShiftImage(base64, STAFF_MEMBERS);
             
             // Map the AI result to Shift objects
             const newShifts: Shift[] = parsedData.map((item: any) => ({
               id: Date.now().toString() + Math.random().toString(),
               date: item.date,
               dayStaffId: findStaffIdByName(item.dayStaffName),
               nightStaffId: findStaffIdByName(item.nightStaffName)
             })).filter(s => s.dayStaffId || s.nightStaffId); // Filter out empty matches

             if (newShifts.length > 0) {
               onImportSchedule(file.name, 'STAFF_SHIFT', newShifts);
               setCompleteMsg(`${file.name} から ${newShifts.length}件のシフトデータを解析・反映しました`);
             } else {
               setCompleteMsg(`画像を解析しましたが、有効なシフトが見つかりませんでした。`);
             }
          } catch (err) {
             setCompleteMsg("AI解析中にエラーが発生しました");
          } finally {
             setIsProcessing(false);
          }
        };
        reader.readAsDataURL(file);

      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
        // Mock Excel import
        setTimeout(() => {
          onImportSchedule(file.name, 'STAFF_SHIFT');
          setCompleteMsg(`${file.name} から業務シフトを読み込みました`);
          setIsProcessing(false);
        }, 1500);
      } else if (file.type.startsWith('image/')) {
         setTimeout(() => {
           setCompleteMsg(`${file.name} を画像ライブラリに保存しました`);
           setIsProcessing(false);
         }, 1000);
      } else {
        setTimeout(() => {
           setCompleteMsg(`${file.name} を取り込みました`);
           setIsProcessing(false);
        }, 1000);
      }
    } catch (error) {
      setCompleteMsg("エラーが発生しました");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-popIn">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-2">データの取り込み</h2>
        <p className="text-sm text-gray-500 mb-6">
          利用予定表、シフト表(画像OK)、写真などをドラッグ＆ドロップしてください。AIが内容を自動認識します。
        </p>

        <div 
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {isProcessing ? (
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-3" />
              <p className="text-blue-600 font-medium">AI解析中...</p>
              <p className="text-xs text-gray-400 mt-1">シフト表の日付や名前を読み取っています</p>
            </div>
          ) : completeMsg ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-green-700 font-bold mb-1">完了</p>
              <p className="text-sm text-gray-600">{completeMsg}</p>
              <button 
                 onClick={(e) => { e.stopPropagation(); setCompleteMsg(null); }}
                 className="mt-4 text-xs text-blue-600 hover:underline"
              >
                続けて取り込む
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
              </div>
              <p className="font-bold text-gray-700 mb-1">ここへファイルをドロップ</p>
              <p className="text-xs text-gray-400 mb-4">またはクリックして選択</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:bg-blue-700 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                ファイルを選択
              </button>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple 
            accept=".xlsx,.xls,.csv,image/*,.pdf"
            onChange={handleFileSelect}
          />
        </div>

        <div className="mt-6">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">対応フォーマット</h3>
           <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
             <div className="flex items-center gap-2"><CalendarDays className="w-3 h-3 text-orange-600" /> 利用予定表 (Excel)</div>
             <div className="flex items-center gap-2"><FileSpreadsheet className="w-3 h-3 text-green-600" /> シフト表 (Excel/画像)</div>
             <div className="flex items-center gap-2"><Image className="w-3 h-3 text-blue-600" /> 写真 (AI解析対応)</div>
             <div className="flex items-center gap-2"><FileText className="w-3 h-3 text-red-600" /> 書類 (PDF)</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;