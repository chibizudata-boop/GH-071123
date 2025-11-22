
import React, { useState, useRef } from 'react';
import { StoredFile, Album, Resident } from '../types';
import { Image, Plus, RotateCw, Type, X, Save, Trash2, FolderPlus, Folder, PlayCircle, Video as VideoIcon } from 'lucide-react';

interface PhotoAlbumProps {
  resident: Resident;
  files: StoredFile[];
  albums: Album[];
  onUpdateFile: (file: StoredFile) => void;
  onDeleteFile: (fileId: string) => void;
  onAddFile: (file: StoredFile) => void;
  onAddAlbum: (album: Album) => void;
}

const PhotoAlbum: React.FC<PhotoAlbumProps> = ({ 
  resident, 
  files, 
  albums, 
  onUpdateFile, 
  onDeleteFile, 
  onAddFile,
  onAddAlbum
}) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<StoredFile | null>(null);
  const [playingVideo, setPlayingVideo] = useState<StoredFile | null>(null);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter images and videos
  const currentFiles = selectedAlbumId 
    ? files.filter(f => f.albumId === selectedAlbumId && (f.type === 'image' || f.type === 'video'))
    : files.filter(f => f.type === 'image' || f.type === 'video');

  // Filter to show only Albums in root view
  const showAlbums = !selectedAlbumId;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video');
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFile: StoredFile = {
          id: Date.now().toString(),
          name: file.name,
          type: isVideo ? 'video' : 'image',
          url: reader.result as string,
          date: new Date().toISOString().split('T')[0],
          albumId: selectedAlbumId || undefined,
          rotation: 0
        };
        onAddFile(newFile);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateAlbum = () => {
    if (!newAlbumTitle.trim()) return;
    onAddAlbum({
      id: Date.now().toString(),
      title: newAlbumTitle,
      residentId: resident.id,
      createdAt: new Date().toISOString().split('T')[0]
    });
    setNewAlbumTitle('');
    setIsCreatingAlbum(false);
  };

  const handleRotate = () => {
    if (editingFile && editingFile.type === 'image') {
      const currentRotation = editingFile.rotation || 0;
      setEditingFile({ ...editingFile, rotation: (currentRotation + 90) % 360 });
    }
  };

  const handleSaveEdit = () => {
    if (editingFile) {
      onUpdateFile(editingFile);
      setEditingFile(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb / Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {selectedAlbumId && (
            <button 
              onClick={() => setSelectedAlbumId(null)}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              アルバム一覧
            </button>
          )}
          {selectedAlbumId && <span className="text-gray-300">/</span>}
          <h3 className="font-bold text-gray-800">
            {selectedAlbumId ? albums.find(a => a.id === selectedAlbumId)?.title : 'アルバム一覧'}
          </h3>
        </div>
        <div className="flex gap-2">
          {!selectedAlbumId && (
            <button 
              onClick={() => setIsCreatingAlbum(true)}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1.5 rounded hover:bg-gray-200 flex items-center gap-1"
            >
              <FolderPlus className="w-3 h-3" /> 作成
            </button>
          )}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-xs bg-blue-50 text-blue-600 px-2 py-1.5 rounded hover:bg-blue-100 flex items-center gap-1 font-bold"
          >
            <Plus className="w-3 h-3" /> 追加
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
        </div>
      </div>

      {/* Create Album Input */}
      {isCreatingAlbum && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex gap-2 animate-fadeIn">
          <input 
            type="text" 
            value={newAlbumTitle}
            onChange={(e) => setNewAlbumTitle(e.target.value)}
            placeholder="新しいアルバム名"
            className="flex-1 text-sm border-gray-300 rounded px-2 outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <button onClick={handleCreateAlbum} className="text-xs bg-blue-600 text-white px-3 rounded">保存</button>
          <button onClick={() => setIsCreatingAlbum(false)} className="text-xs text-gray-500 px-2">キャンセル</button>
        </div>
      )}

      {/* Content */}
      {showAlbums ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Default "All Files" Album */}
          <div 
            onClick={() => setSelectedAlbumId('ALL')} 
            className="aspect-square bg-gray-100 rounded-xl border-2 border-transparent hover:border-blue-300 cursor-pointer flex flex-col items-center justify-center p-4 transition-all"
          >
             <div className="flex gap-1 mb-2">
                <Image className="w-6 h-6 text-gray-400" />
                <VideoIcon className="w-6 h-6 text-gray-400" />
             </div>
             <span className="text-sm font-bold text-gray-600">全ての写真・動画</span>
             <span className="text-xs text-gray-400">{files.filter(f => f.type === 'image' || f.type === 'video').length}件</span>
          </div>

          {albums.map(album => {
             const cover = files.find(f => f.albumId === album.id && f.type === 'image');
             return (
              <div 
                key={album.id}
                onClick={() => setSelectedAlbumId(album.id)}
                className="relative aspect-square bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md cursor-pointer overflow-hidden transition-all group"
              >
                {cover ? (
                   <img src={cover.url} alt="cover" className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center">
                      <Folder className="w-8 h-8 text-blue-200" />
                   </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 flex flex-col justify-end p-3">
                  <span className="text-white font-bold text-sm truncate">{album.title}</span>
                  <span className="text-white/80 text-xs">{files.filter(f => f.albumId === album.id).length}件</span>
                </div>
              </div>
             );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
           {(selectedAlbumId === 'ALL' ? files.filter(f => f.type === 'image' || f.type === 'video') : currentFiles).map(file => (
             <div 
               key={file.id} 
               className="group relative aspect-square bg-black rounded-xl overflow-hidden cursor-pointer border border-gray-200"
               onClick={() => {
                 if (file.type === 'video') {
                   setPlayingVideo(file);
                 } else {
                   setEditingFile(file);
                 }
               }}
             >
               {file.type === 'video' ? (
                 <>
                   <video src={file.url} className="w-full h-full object-cover opacity-80" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <PlayCircle className="w-12 h-12 text-white opacity-80" />
                   </div>
                   <div className="absolute top-2 right-2 bg-black/50 p-1 rounded text-white">
                     <VideoIcon className="w-3 h-3" />
                   </div>
                 </>
               ) : (
                 <img 
                    src={file.url} 
                    alt={file.name} 
                    className="w-full h-full object-cover"
                    style={{ transform: `rotate(${file.rotation || 0}deg)` }}
                  />
               )}
               
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                 <button 
                   onClick={(e) => { e.stopPropagation(); setEditingFile(file); }}
                   className="p-2 bg-white rounded-full shadow-lg hover:bg-blue-50 text-blue-600"
                 >
                   <Type className="w-4 h-4" />
                 </button>
               </div>
               {file.description && (
                 <div className="absolute bottom-0 w-full bg-black/60 p-2">
                   <p className="text-white text-[10px] truncate">{file.description}</p>
                 </div>
               )}
             </div>
           ))}
           {currentFiles.length === 0 && selectedAlbumId !== 'ALL' && (
             <div className="col-span-2 py-8 text-center text-gray-400 text-xs">
               写真・動画がありません。<br/>右上のボタンから追加してください。
             </div>
           )}
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg">
            <div className="flex justify-between items-center mb-2 text-white">
              <h3 className="font-bold">{playingVideo.name}</h3>
              <button onClick={() => setPlayingVideo(null)}><X className="w-6 h-6" /></button>
            </div>
            <video 
              src={playingVideo.url} 
              controls 
              autoPlay 
              className="w-full rounded-lg shadow-2xl max-h-[80vh]"
            />
            {playingVideo.description && (
              <p className="text-gray-300 text-sm mt-2 p-2 bg-white/10 rounded">{playingVideo.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal (For Image & Video metadata) */}
      {editingFile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden animate-popIn">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-800">{editingFile.type === 'video' ? '動画情報を編集' : '写真を編集'}</h3>
              <button onClick={() => setEditingFile(null)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="p-4 bg-gray-100 flex justify-center">
               <div className="relative max-h-[300px] overflow-hidden rounded-lg shadow-sm bg-white">
                  {editingFile.type === 'video' ? (
                    <video src={editingFile.url} className="max-h-[300px] w-auto" controls />
                  ) : (
                    <img 
                      src={editingFile.url} 
                      className="max-h-[300px] w-auto object-contain transition-transform duration-300"
                      style={{ transform: `rotate(${editingFile.rotation || 0}deg)` }}
                      alt="editing" 
                    />
                  )}
               </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">キャプション（説明）</label>
                <input 
                  type="text" 
                  value={editingFile.description || ''}
                  onChange={(e) => setEditingFile({...editingFile, description: e.target.value})}
                  placeholder="状況や様子の説明を入力..."
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <div className="flex gap-2 justify-center border-t border-gray-100 pt-4">
                 {editingFile.type === 'image' && (
                   <button 
                     onClick={handleRotate}
                     className="flex flex-col items-center justify-center w-16 p-2 rounded hover:bg-gray-100 text-gray-600 gap-1"
                   >
                     <RotateCw className="w-5 h-5" />
                     <span className="text-[10px]">回転</span>
                   </button>
                 )}
                 <button 
                   onClick={() => onDeleteFile(editingFile.id)} // Not fully implemented in props passing for simplicity
                   className="flex flex-col items-center justify-center w-16 p-2 rounded hover:bg-red-50 text-red-600 gap-1"
                 >
                   <Trash2 className="w-5 h-5" />
                   <span className="text-[10px]">削除</span>
                 </button>
              </div>

              <button 
                onClick={handleSaveEdit}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                変更を保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoAlbum;
