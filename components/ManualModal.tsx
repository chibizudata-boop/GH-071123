
import React, { useState, useRef } from 'react';
import { CompanyResource, StoredFile } from '../types';
import { X, BookOpen, FileText, ChevronRight, ChevronDown, Clock, Upload, Image, Video, MessageCircle, Paperclip, Share2, PlayCircle, FileSpreadsheet } from 'lucide-react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: CompanyResource[];
  onUpdateResource: (updatedResource: CompanyResource) => void;
}

const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose, resources, onUpdateResource }) => {
  const [activeTab, setActiveTab] = useState<'PHILOSOPHY' | 'MANUAL'>('PHILOSOPHY');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingForId, setUploadingForId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter resources based on tab
  const displayResources = resources.filter(r => {
    if (activeTab === 'PHILOSOPHY') return r.category === 'PHILOSOPHY';
    return r.category.startsWith('MANUAL');
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleUploadClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadingForId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingForId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isPdf = file.type.includes('pdf');
        const isExcel = file.type.includes('sheet') || file.type.includes('excel');
        
        let fileType: 'image' | 'video' | 'pdf' | 'excel' | 'other' = 'other';
        if (isImage) fileType = 'image';
        else if (isVideo) fileType = 'video';
        else if (isPdf) fileType = 'pdf';
        else if (isExcel) fileType = 'excel';

        const newFile: StoredFile = {
          id: Date.now().toString(),
          name: file.name,
          type: fileType,
          url: reader.result as string,
          date: new Date().toISOString().split('T')[0]
        };
        
        const targetResource = resources.find(r => r.id === uploadingForId);
        if (targetResource) {
          const updatedResource = {
            ...targetResource,
            files: [...(targetResource.files || []), newFile]
          };
          onUpdateResource(updatedResource);
        }
        setUploadingForId(null);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleShareToLine = (resource: CompanyResource, e: React.MouseEvent) => {
    e.stopPropagation();
    const filesList = resource.files && resource.files.length > 0 
        ? `\n\n【添付ファイル】\n${resource.files.map(f => `・${f.name}`).join('\n')}` 
        : '';

    const message = `【CareSync マニュアル共有】\n\n■${resource.title}\n\n${resource.content}${filesList}`;
    
    const url = `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg h-[85vh] rounded-2xl shadow-2xl flex flex-col animate-popIn overflow-hidden">
        
        {/* Header */}
        <div className="bg-green-700 p-4 flex justify-between items-center text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            <h2 className="text-lg font-bold">会社情報・マニュアル</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={() => { setActiveTab('PHILOSOPHY'); setExpandedId(null); }}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              activeTab === 'PHILOSOPHY' 
                ? 'bg-white text-green-700 border-b-2 border-green-700' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            理念・行動指針
          </button>
          <button
            onClick={() => { setActiveTab('MANUAL'); setExpandedId(null); }}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              activeTab === 'MANUAL' 
                ? 'bg-white text-green-700 border-b-2 border-green-700' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            業務マニュアル
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          {displayResources.length > 0 ? (
            <div className="space-y-3">
              {displayResources.map((resource) => {
                const isExpanded = expandedId === resource.id;
                return (
                  <div 
                    key={resource.id} 
                    className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
                      isExpanded ? 'border-green-200 shadow-md ring-1 ring-green-100' : 'border-gray-200 shadow-sm'
                    }`}
                  >
                    <button
                      onClick={() => toggleExpand(resource.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isExpanded ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">{resource.title}</h3>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                            <Clock className="w-3 h-3" />
                            更新: {resource.lastUpdated}
                            {resource.files && resource.files.length > 0 && (
                                <span className="flex items-center gap-0.5 ml-2 text-blue-500">
                                    <Paperclip className="w-3 h-3" />
                                    {resource.files.length}
                                </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* LINE Share Button (Visible on hover or expand) */}
                        <div 
                            onClick={(e) => handleShareToLine(resource, e)}
                            className={`p-2 rounded-full hover:bg-green-100 text-green-500 transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                            title="LINEで共有"
                        >
                             <MessageCircle className="w-5 h-5" />
                        </div>

                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-green-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 animate-fadeIn">
                        <div className="h-px w-full bg-gray-100 mb-4"></div>
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                          {resource.content}
                        </div>

                        {/* Attached Files Section */}
                        <div className="mt-4">
                           <div className="flex justify-between items-center mb-2">
                               <h4 className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                   <Paperclip className="w-3 h-3" /> 添付ファイル・資料
                               </h4>
                               <button 
                                 onClick={(e) => handleUploadClick(resource.id, e)}
                                 className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 flex items-center gap-1 font-bold"
                               >
                                   <Upload className="w-3 h-3" /> 追加
                               </button>
                           </div>
                           
                           {resource.files && resource.files.length > 0 ? (
                               <div className="grid grid-cols-2 gap-2">
                                   {resource.files.map(file => (
                                       <button 
                                         key={file.id} 
                                         onClick={() => setPreviewFile(file)}
                                         className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:bg-gray-100 transition-colors text-left"
                                       >
                                           {file.type === 'image' ? (
                                               <img src={file.url} alt="thumb" className="w-10 h-10 object-cover rounded" />
                                           ) : file.type === 'video' ? (
                                               <div className="w-10 h-10 bg-black rounded flex items-center justify-center flex-shrink-0">
                                                   <Video className="w-5 h-5 text-white" />
                                               </div>
                                           ) : file.type === 'excel' ? (
                                               <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                                                   <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                               </div>
                                           ) : (
                                               <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                                   <FileText className="w-5 h-5 text-gray-500" />
                                               </div>
                                           )}
                                           <div className="flex-1 min-w-0">
                                               <p className="text-xs font-bold text-gray-700 truncate">{file.name}</p>
                                               <p className="text-[10px] text-gray-400 uppercase">{file.type}</p>
                                           </div>
                                       </button>
                                   ))}
                               </div>
                           ) : (
                               <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400">
                                   ファイルは添付されていません
                               </div>
                           )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>該当する情報はありません</p>
            </div>
          )}
        </div>
        
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange} 
            accept="image/*,video/*,.pdf,.xlsx,.xls,.docx"
        />

        <div className="p-3 bg-white border-t border-gray-200 text-center text-xs text-gray-400 flex-shrink-0">
           基本方針・手順に変更がある場合は管理者に確認してください
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-3xl flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-4 text-white">
              <div>
                <h3 className="font-bold text-lg">{previewFile.name}</h3>
                <p className="text-xs opacity-80">{previewFile.date}</p>
              </div>
              <button 
                onClick={() => setPreviewFile(null)}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="rounded-lg overflow-hidden shadow-2xl bg-black max-h-[80vh] max-w-full">
              {previewFile.type === 'image' ? (
                <img src={previewFile.url} alt="preview" className="max-h-[80vh] w-auto object-contain" />
              ) : previewFile.type === 'video' ? (
                <video src={previewFile.url} controls className="max-h-[80vh] w-auto" />
              ) : (
                <div className="p-12 bg-white text-gray-800 flex flex-col items-center justify-center gap-4 min-w-[300px]">
                   <FileText className="w-16 h-16 text-gray-400" />
                   <p className="font-bold">このファイルはプレビューできません</p>
                   <p className="text-xs text-gray-500">PDFやExcelファイルは端末にダウンロードしてご確認ください</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualModal;
