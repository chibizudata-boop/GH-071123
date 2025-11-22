
import React, { useState } from 'react';
import { Shift, Staff } from '../types';
import { STAFF_MEMBERS } from '../constants';
import { Calendar, Moon, Sun, User, ChevronLeft, ChevronRight, List, LayoutGrid, Clock, Upload } from 'lucide-react';

interface ShiftTabProps {
  shifts: Shift[];
  onUpdateShift: (shift: Shift) => void;
  onImportClick?: () => void;
}

const ShiftTab: React.FC<ShiftTabProps> = ({ shifts, onUpdateShift, onImportClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK' | 'DAY'>('MONTH');
  const [editingShift, setEditingShift] = useState<{ date: string, type: 'DAY' | 'NIGHT' } | null>(null);

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const handlePrev = () => {
    if (viewMode === 'MONTH') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    else if (viewMode === 'WEEK') setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(addDays(currentDate, -1));
  };

  const handleNext = () => {
    if (viewMode === 'MONTH') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    else if (viewMode === 'WEEK') setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const getDatesToDisplay = () => {
    const dates = [];
    if (viewMode === 'MONTH') {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Pad start with previous month days to match weekday
      const startDay = start.getDay();
      for (let i = startDay; i > 0; i--) {
         dates.push(addDays(start, -i));
      }
      
      for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    } else if (viewMode === 'WEEK') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      for (let i = 0; i < 7; i++) {
        dates.push(new Date(start));
        start.setDate(start.getDate() + 1);
      }
    } else {
      dates.push(new Date(currentDate));
    }
    return dates;
  };

  const displayDates = getDatesToDisplay();

  const handleStaffSelect = (staffId: string) => {
    if (!editingShift) return;
    
    const dateStr = editingShift.date;
    const existingShift = shifts.find(s => s.date === dateStr);

    let updatedShift: Shift;
    if (existingShift) {
      updatedShift = {
        ...existingShift,
        dayStaffId: editingShift.type === 'DAY' ? staffId : existingShift.dayStaffId,
        nightStaffId: editingShift.type === 'NIGHT' ? staffId : existingShift.nightStaffId
      };
    } else {
      updatedShift = {
        id: Date.now().toString(),
        date: dateStr,
        dayStaffId: editingShift.type === 'DAY' ? staffId : undefined,
        nightStaffId: editingShift.type === 'NIGHT' ? staffId : undefined
      };
    }
    
    onUpdateShift(updatedShift);
    setEditingShift(null);
  };

  const getStaffName = (id?: string) => {
    const staff = STAFF_MEMBERS.find(s => s.id === id);
    return staff ? staff.name : null;
  };
  
  const getStaffInitials = (id?: string) => {
     const staff = STAFF_MEMBERS.find(s => s.id === id);
     return staff ? staff.name[0] : '?';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-20 flex flex-col h-[calc(100vh-160px)]">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-gray-50 gap-3">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          シフト管理表
        </h2>
        
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${viewMode === 'MONTH' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
            >
              <LayoutGrid className="w-3 h-3" /> 月
            </button>
            <button 
              onClick={() => setViewMode('WEEK')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${viewMode === 'WEEK' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
            >
              <List className="w-3 h-3" /> 週
            </button>
            <button 
              onClick={() => setViewMode('DAY')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${viewMode === 'DAY' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
            >
              <Clock className="w-3 h-3" /> 日
            </button>
        </div>

        <div className="flex items-center gap-2">
           {onImportClick && (
             <button 
                onClick={onImportClick}
                className="flex items-center gap-1 bg-white border border-green-200 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-50 transition-colors shadow-sm mr-2"
             >
               <Upload className="w-3 h-3" /> 画像取込
             </button>
           )}
          <div className="flex items-center gap-1 text-sm">
            <button onClick={handlePrev} className="p-1 hover:bg-gray-200 rounded"><ChevronLeft className="w-4 h-4" /></button>
            <span className="font-mono font-bold text-gray-600 w-32 text-center">
              {viewMode === 'MONTH' && `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`}
              {viewMode === 'WEEK' && `${currentDate.getMonth() + 1}月`}
              {viewMode === 'DAY' && `${currentDate.getMonth() + 1}月${currentDate.getDate()}日`}
            </span>
            <button onClick={handleNext} className="p-1 hover:bg-gray-200 rounded"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        
        {/* MONTH VIEW */}
        {viewMode === 'MONTH' && (
          <div className="grid grid-cols-7 bg-gray-200 gap-px border-b border-gray-200">
            {['日','月','火','水','木','金','土'].map((d, i) => (
              <div key={i} className={`bg-gray-50 p-2 text-center text-xs font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
                {d}
              </div>
            ))}
            {displayDates.map((date, i) => {
              const dateStr = formatDate(date);
              const shift = shifts.find(s => s.date === dateStr);
              const isToday = dateStr === formatDate(new Date());
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();

              return (
                <div key={i} className={`bg-white min-h-[100px] p-1 flex flex-col ${!isCurrentMonth ? 'opacity-40 bg-gray-50' : ''}`}>
                  <div className={`text-xs font-bold mb-1 flex justify-between ${isToday ? 'text-green-600' : ''}`}>
                    <span className={isToday ? 'bg-green-100 px-1 rounded' : ''}>{date.getDate()}</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-1">
                    <button 
                       onClick={() => setEditingShift({ date: dateStr, type: 'DAY' })}
                       className={`flex items-center gap-1 text-[10px] px-1 py-0.5 rounded border ${shift?.dayStaffId ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-dashed border-gray-300'}`}
                    >
                       <Sun className="w-3 h-3 text-orange-500" />
                       <span className="truncate">{getStaffName(shift?.dayStaffId) || '-'}</span>
                    </button>
                    <button 
                       onClick={() => setEditingShift({ date: dateStr, type: 'NIGHT' })}
                       className={`flex items-center gap-1 text-[10px] px-1 py-0.5 rounded border ${shift?.nightStaffId ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-dashed border-gray-300'}`}
                    >
                       <Moon className="w-3 h-3 text-indigo-500" />
                       <span className="truncate">{getStaffName(shift?.nightStaffId) || '-'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* WEEK VIEW */}
        {viewMode === 'WEEK' && (
          <div className="divide-y divide-gray-100">
            {displayDates.map(date => {
              const dateStr = formatDate(date);
              const shift = shifts.find(s => s.date === dateStr);
              const isToday = dateStr === formatDate(new Date());

              return (
                <div key={dateStr} className={`p-4 ${isToday ? 'bg-green-50/30' : 'bg-white'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-10 text-center font-bold text-lg ${date.getDay() === 0 ? 'text-red-500' : date.getDay() === 6 ? 'text-blue-500' : 'text-gray-700'}`}>
                      {date.getDate()}
                    </div>
                    <div className="text-xs text-gray-400">
                       {['日','月','火','水','木','金','土'][date.getDay()]}曜日
                    </div>
                    {isToday && <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full">今日</span>}
                  </div>

                  <div className="flex gap-4 pl-12">
                     <div 
                       onClick={() => setEditingShift({ date: dateStr, type: 'DAY' })}
                       className="flex-1 border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:border-orange-300 cursor-pointer bg-white"
                     >
                        <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                          <Sun className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold">日勤 9:00-17:00</p>
                          <p className="text-sm font-bold text-gray-800">{getStaffName(shift?.dayStaffId) || '未設定'}</p>
                        </div>
                     </div>

                     <div 
                       onClick={() => setEditingShift({ date: dateStr, type: 'NIGHT' })}
                       className="flex-1 border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:border-indigo-300 cursor-pointer bg-white"
                     >
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                          <Moon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold">夜勤 17:00-9:00</p>
                          <p className="text-sm font-bold text-gray-800">{getStaffName(shift?.nightStaffId) || '未設定'}</p>
                        </div>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DAY VIEW */}
        {viewMode === 'DAY' && (
           <div className="p-6 flex items-center justify-center h-full bg-gray-50">
             <div className="bg-white w-full max-w-md rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-green-600 p-6 text-white text-center">
                   <h3 className="text-2xl font-bold mb-1">{currentDate.getDate()}日</h3>
                   <p className="opacity-80">{currentDate.getFullYear()}年{currentDate.getMonth() + 1}月</p>
                </div>
                <div className="p-6 space-y-6">
                   {/* Day Slot */}
                   <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <Sun className="w-6 h-6 text-orange-500" />
                        <div className="h-full w-0.5 bg-gray-200 min-h-[40px]"></div>
                      </div>
                      <div className="flex-1">
                         <h4 className="text-sm font-bold text-gray-500 mb-1">日勤 (9:00 - 17:00)</h4>
                         <button 
                           onClick={() => setEditingShift({ date: formatDate(currentDate), type: 'DAY' })}
                           className="w-full p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-3 hover:bg-orange-100 transition-colors text-left"
                         >
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-600 font-bold text-lg shadow-sm">
                              {getStaffInitials(shifts.find(s => s.date === formatDate(currentDate))?.dayStaffId)}
                            </div>
                            <span className="font-bold text-gray-800 text-lg">
                              {getStaffName(shifts.find(s => s.date === formatDate(currentDate))?.dayStaffId) || '未設定'}
                            </span>
                         </button>
                      </div>
                   </div>

                   {/* Night Slot */}
                   <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <Moon className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div className="flex-1">
                         <h4 className="text-sm font-bold text-gray-500 mb-1">夜勤 (17:00 - 9:00)</h4>
                         <button 
                           onClick={() => setEditingShift({ date: formatDate(currentDate), type: 'NIGHT' })}
                           className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3 hover:bg-indigo-100 transition-colors text-left"
                         >
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm">
                              {getStaffInitials(shifts.find(s => s.date === formatDate(currentDate))?.nightStaffId)}
                            </div>
                            <span className="font-bold text-gray-800 text-lg">
                              {getStaffName(shifts.find(s => s.date === formatDate(currentDate))?.nightStaffId) || '未設定'}
                            </span>
                         </button>
                      </div>
                   </div>
                </div>
             </div>
           </div>
        )}

      </div>

      {/* Staff Selector Modal */}
      {editingShift && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4">
           <div className="bg-white w-full max-w-sm sm:rounded-2xl rounded-t-2xl overflow-hidden animate-slideUp sm:animate-popIn">
             <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
               <div>
                 <h3 className="font-bold text-gray-800">スタッフ割り当て</h3>
                 <p className="text-xs text-gray-500">
                   {editingShift.date} {editingShift.type === 'DAY' ? '日勤 (9:00-17:00)' : '夜勤 (17:00-9:00)'}
                 </p>
               </div>
             </div>
             <div className="p-2 max-h-[60vh] overflow-y-auto">
               {STAFF_MEMBERS.map(staff => (
                 <button
                   key={staff.id}
                   onClick={() => handleStaffSelect(staff.id)}
                   className="w-full p-3 flex items-center gap-3 hover:bg-green-50 rounded-xl transition-colors text-left"
                 >
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${staff.role === 'manager' ? 'bg-purple-500' : staff.role === 'nurse' ? 'bg-pink-500' : 'bg-green-500'}`}>
                     {staff.name[0]}
                   </div>
                   <div>
                     <p className="font-bold text-gray-800">{staff.name}</p>
                     <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{staff.role}</span>
                   </div>
                 </button>
               ))}
               <button 
                 onClick={() => setEditingShift(null)}
                 className="w-full p-3 text-center text-gray-500 font-medium mt-2"
               >
                 キャンセル
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShiftTab;
