
import React, { useState } from 'react';
import { IncidentReport, ReportType, User, Staff } from '../types';
import { STAFF_MEMBERS } from '../constants';
import { AlertTriangle, FileWarning, Plus, CheckCircle2, Eye, Clock, MapPin, User as UserIcon, HelpCircle, ChevronRight, X, Download, Share2, FileSpreadsheet, MessageCircle } from 'lucide-react';

interface ReportTabProps {
  reports: IncidentReport[];
  currentUser: User;
  onAddReport: (report: IncidentReport) => void;
  onMarkAsRead: (reportId: string) => void;
}

const ReportTab: React.FC<ReportTabProps> = ({ reports, currentUser, onAddReport, onMarkAsRead }) => {
  const [activeTab, setActiveTab] = useState<ReportType>('HIYARI');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);

  // Filter reports
  const displayReports = reports.filter(r => r.type === activeTab).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleReportClick = (report: IncidentReport) => {
    setSelectedReport(report);
    if (!report.readByStaffIds.includes(currentUser.id)) {
      onMarkAsRead(report.id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 pb-20">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-100 shadow-sm">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <FileWarning className="w-5 h-5 text-red-500" />
          報告書・ヒヤリハット
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex p-4 gap-3">
        <button 
          onClick={() => setActiveTab('HIYARI')}
          className={`flex-1 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'HIYARI' ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
        >
          <AlertTriangle className="w-4 h-4" /> ヒヤリハット
        </button>
        <button 
          onClick={() => setActiveTab('ACCIDENT')}
          className={`flex-1 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'ACCIDENT' ? 'bg-red-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
        >
          <FileWarning className="w-4 h-4" /> 事故報告書
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3">
        {displayReports.length > 0 ? (
          displayReports.map(report => {
            const isUnread = !report.readByStaffIds.includes(currentUser.id);
            const readCount = report.readByStaffIds.length;
            const totalStaff = STAFF_MEMBERS.length;

            return (
              <div 
                key={report.id} 
                onClick={() => handleReportClick(report)}
                className={`bg-white p-4 rounded-xl shadow-sm border-l-4 cursor-pointer transition-all hover:shadow-md relative ${report.type === 'HIYARI' ? 'border-orange-400' : 'border-red-600'}`}
              >
                {isUnread && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-bold text-red-500 animate-pulse">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span> 未読
                  </div>
                )}
                <div className="mb-2 pr-12">
                  <span className="text-xs text-gray-400 block mb-0.5">{new Date(report.createdAt).toLocaleString()}</span>
                  <h3 className="font-bold text-gray-800 line-clamp-1">{report.what}</h3>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mt-3 border-t border-gray-50 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">対象: {report.who}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-gray-600">
                    作成者: {report.authorName}
                  </div>
                </div>

                <div className="mt-2 flex justify-end">
                   <div className="flex items-center gap-1 text-[10px]">
                    <Eye className="w-3 h-3 text-gray-400" />
                    <span className={readCount < totalStaff ? 'text-orange-500 font-bold' : 'text-green-600'}>
                      既読 {readCount}/{totalStaff}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>報告書はまだありません</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className={`fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${activeTab === 'HIYARI' ? 'bg-orange-500' : 'bg-red-600'}`}
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Create Modal */}
      <CreateReportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        type={activeTab}
        authorId={currentUser.id}
        authorName={currentUser.name}
        onSubmit={onAddReport}
      />

      {/* Detail Modal */}
      {selectedReport && (
        <ReportDetailModal 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      )}
    </div>
  );
};

const CreateReportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  type: ReportType;
  authorId: string;
  authorName: string;
  onSubmit: (report: IncidentReport) => void;
}> = ({ isOpen, onClose, type, authorId, authorName, onSubmit }) => {
  const [formData, setFormData] = useState({
    when: '',
    where: '',
    who: '',
    what: '',
    why: '',
    how: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: IncidentReport = {
      id: Date.now().toString(),
      type,
      createdAt: new Date().toISOString(),
      authorId,
      authorName,
      readByStaffIds: [authorId], // Author has read it
      ...formData
    };
    onSubmit(newReport);
    setFormData({ when: '', where: '', who: '', what: '', why: '', how: '' }); // Reset
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-popIn">
        <div className={`p-4 border-b flex justify-between items-center ${type === 'HIYARI' ? 'bg-orange-50' : 'bg-red-50'}`}>
          <h3 className={`font-bold text-lg ${type === 'HIYARI' ? 'text-orange-700' : 'text-red-700'}`}>
            {type === 'HIYARI' ? 'ヒヤリハット報告' : '事故報告書'} 作成
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-600 mb-4 flex justify-between items-center">
            <span>記入者: <strong>{authorName}</strong></span>
            <span className="text-xs bg-gray-200 px-2 py-1 rounded">{new Date().toLocaleDateString()}</span>
          </div>

          <p className="text-xs text-gray-400 mb-2">
            5W1Hに基づいて事実を客観的に記入してください。
          </p>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> When (いつ)</label>
            <input 
              type="datetime-local" 
              required
              value={formData.when}
              onChange={e => setFormData({...formData, when: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Where (どこで)</label>
            <input 
              type="text" 
              required
              placeholder="例: 食堂、101号室"
              value={formData.where}
              onChange={e => setFormData({...formData, where: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><UserIcon className="w-3 h-3" /> Who (誰が/誰に)</label>
            <input 
              type="text" 
              required
              placeholder="対象の利用者名など"
              value={formData.who}
              onChange={e => setFormData({...formData, who: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><FileWarning className="w-3 h-3" /> What (何を/何が起きた)</label>
            <textarea 
              required
              rows={3}
              placeholder="事実を簡潔に..."
              value={formData.what}
              onChange={e => setFormData({...formData, what: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><HelpCircle className="w-3 h-3" /> Why (なぜ)</label>
            <textarea 
              required
              rows={3}
              placeholder="原因の分析..."
              value={formData.why}
              onChange={e => setFormData({...formData, why: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> How (どうした/今後の対策)</label>
            <textarea 
              required
              rows={3}
              placeholder="対応内容と再発防止策..."
              value={formData.how}
              onChange={e => setFormData({...formData, how: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button 
            type="submit"
            className={`w-full py-3 rounded-xl text-white font-bold shadow-lg mt-4 ${type === 'HIYARI' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-red-600 hover:bg-red-700'}`}
          >
            報告書を提出
          </button>
        </form>
      </div>
    </div>
  );
};

const ReportDetailModal: React.FC<{
  report: IncidentReport;
  onClose: () => void;
}> = ({ report, onClose }) => {
  const totalStaff = STAFF_MEMBERS.length;
  const readCount = report.readByStaffIds.length;

  // Excel Export (CSV)
  const handleDownloadCSV = () => {
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // BOM for Excel utf-8
    const header = "タイプ,作成日時,記入者,いつ(When),どこで(Where),誰が(Who),何が(What),なぜ(Why),対策(How)\n";
    const typeStr = report.type === 'HIYARI' ? 'ヒヤリハット' : '事故報告書';
    const cleanText = (text: string) => `"${text.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    
    const row = [
      typeStr,
      new Date(report.createdAt).toLocaleString(),
      cleanText(report.authorName),
      cleanText(report.when),
      cleanText(report.where),
      cleanText(report.who),
      cleanText(report.what),
      cleanText(report.why),
      cleanText(report.how)
    ].join(",");

    const blob = new Blob([bom, header, row], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${typeStr}_${report.authorName}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // LINE Share
  const handleShareLine = () => {
    const text = `
【${report.type === 'HIYARI' ? 'ヒヤリハット' : '事故報告書'}】
作成者: ${report.authorName}

■日時: ${report.when}
■場所: ${report.where}
■対象: ${report.who}

■内容(What):
${report.what}

■原因(Why):
${report.why}

■対策(How):
${report.how}
    `.trim();

    const url = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-popIn flex flex-col">
        <div className={`p-4 border-b flex justify-between items-center ${report.type === 'HIYARI' ? 'bg-orange-50' : 'bg-red-50'}`}>
          <div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${report.type === 'HIYARI' ? 'bg-orange-200 text-orange-800' : 'bg-red-200 text-red-800'}`}>
              {report.type === 'HIYARI' ? 'ヒヤリハット' : '事故報告書'}
            </span>
            <p className="text-xs text-gray-500 mt-1">{new Date(report.createdAt).toLocaleString()} 作成</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-6 h-6 text-gray-500" /></button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Author Info */}
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
               <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">記入者</p>
              <p className="font-bold text-gray-800 text-lg">{report.authorName}</p>
            </div>
          </div>

          {/* 5W1H Grid */}
          <div className="grid grid-cols-1 gap-4">
            <DetailItem label="いつ (When)" value={report.when} icon={<Clock />} />
            <DetailItem label="どこで (Where)" value={report.where} icon={<MapPin />} />
            <DetailItem label="誰が (Who)" value={report.who} icon={<UserIcon />} />
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 col-span-1">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                <FileWarning className="w-3 h-3" /> 何が起きた (What)
              </h4>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{report.what}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 col-span-1">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> 原因 (Why)
              </h4>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{report.why}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-xl border border-green-200 col-span-1">
              <h4 className="text-xs font-bold text-green-700 uppercase mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 対応・対策 (How)
              </h4>
              <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed font-medium">{report.how}</p>
            </div>
          </div>

          {/* Read Receipts */}
          <div className="border-t border-gray-100 pt-4">
             <h4 className="text-xs font-bold text-gray-500 mb-2">確認状況 ({readCount}/{totalStaff})</h4>
             <div className="flex flex-wrap gap-2">
               {STAFF_MEMBERS.map(staff => {
                 const isRead = report.readByStaffIds.includes(staff.id);
                 return (
                   <span 
                    key={staff.id}
                    className={`text-xs px-2 py-1 rounded-full border ${isRead ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                   >
                     {staff.name} {isRead && '✓'}
                   </span>
                 );
               })}
             </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex gap-3">
           <button 
             onClick={handleDownloadCSV}
             className="flex-1 flex items-center justify-center gap-2 bg-white border border-green-600 text-green-700 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors shadow-sm"
           >
             <FileSpreadsheet className="w-4 h-4" /> Excel出力
           </button>
           <button 
             onClick={handleShareLine}
             className="flex-1 flex items-center justify-center gap-2 bg-[#06C755] text-white py-3 rounded-xl font-bold hover:bg-[#05b34c] transition-colors shadow-sm"
           >
             <MessageCircle className="w-4 h-4 fill-white" /> LINEで送る
           </button>
        </div>
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: string; icon: any }> = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
    <div className="text-gray-400 w-5 h-5">{icon}</div>
    <div>
      <p className="text-[10px] text-gray-400 uppercase font-bold">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  </div>
);

export default ReportTab;
