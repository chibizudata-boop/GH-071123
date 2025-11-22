
import React from 'react';
import { X, MessageCircle, Upload, Bell, ChevronRight, Shield, FileSpreadsheet, LogOut, Settings as SettingsIcon, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImport: () => void;
  onOpenAdmin?: () => void;
  onLogout: () => void;
  isLineConnected: boolean;
  onToggleLine: () => void;
  userRole?: 'manager' | 'staff' | 'nurse';
  enableAlerts: boolean;
  onToggleAlerts: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onOpenImport,
  onOpenAdmin,
  onLogout,
  isLineConnected, 
  onToggleLine,
  userRole,
  enableAlerts,
  onToggleAlerts
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-xs bg-white h-full shadow-2xl animate-slideLeft overflow-y-auto flex flex-col">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-800 text-lg">設定・メニュー</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-6 flex-1">
          {/* Admin Only Section */}
          {userRole === 'manager' && (
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <h3 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">管理者メニュー</h3>
              <button 
                onClick={() => { onOpenAdmin && onOpenAdmin(); onClose(); }}
                className="w-full flex items-center gap-3 p-3 bg-white border border-green-200 rounded-lg hover:bg-green-100 transition-colors shadow-sm"
              >
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                  <SettingsIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-sm">アプリ編集・管理</p>
                  <p className="text-[10px] text-gray-500">スタッフ・利用者設定</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </button>
            </div>
          )}

          {/* Data Management */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">データ管理</h3>
            <div className="space-y-2">
              <button 
                onClick={() => { onOpenImport(); onClose(); }}
                className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left group"
              >
                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">データの取り込み</p>
                  <p className="text-xs text-gray-500">Excel, 写真, PDFなど</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </button>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">機能設定</h3>
            
            {/* Alert Toggle */}
             <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-3">
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">タスクアラーム</p>
                    <p className="text-xs text-gray-500">遅延時に警告と音で通知</p>
                  </div>
                </div>
                <button 
                  onClick={onToggleAlerts}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center ${enableAlerts ? 'bg-orange-500 justify-end' : 'bg-gray-300 justify-start'}`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
                </button>
              </div>
            </div>

            {/* Line Integration */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-3 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#06C755] text-white rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">LINE連携</p>
                    <p className="text-xs text-gray-500">日報や通知をLINEへ送信</p>
                  </div>
                </div>
                <button 
                  onClick={onToggleLine}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center ${isLineConnected ? 'bg-[#06C755] justify-end' : 'bg-gray-300 justify-start'}`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
                </button>
              </div>
              {isLineConnected && (
                <div className="p-2 bg-green-50 text-xs text-green-800 text-center">
                  <span className="font-bold">連携中:</span> スタッフグループへの通知が有効です
                </div>
              )}
            </div>
          </div>

          {/* Other Settings */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">その他</h3>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left text-gray-600">
                <Shield className="w-5 h-5" />
                <span className="text-sm">セキュリティ・権限</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100">
           <button 
             onClick={onLogout}
             className="w-full py-3 rounded-xl text-red-600 font-bold bg-red-50 hover:bg-red-100 flex items-center justify-center gap-2"
           >
             <LogOut className="w-5 h-5" />
             ログアウト
           </button>
           <p className="text-center text-[10px] text-gray-400 mt-2">v1.5.0 GHちびずアプリ</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
