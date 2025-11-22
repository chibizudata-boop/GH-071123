
import React, { useState, useEffect } from 'react';
import { Resident, ResidentSchedule } from '../types';
import { Calendar, ChevronLeft, ChevronRight, Upload, List, ExternalLink } from 'lucide-react';

interface ResidentScheduleTabProps {
  residents: Resident[];
  schedules: ResidentSchedule[];
  onImportClick: () => void;
  onResidentClick: (residentId: string) => void;
  highlightResidentId?: string | null;
}

const ResidentScheduleTab: React.FC<ResidentScheduleTabProps> = ({ residents, schedules, onImportClick, onResidentClick, highlightResidentId }) => {
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK' | 'DAY'>('MONTH');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (highlightResidentId) {
      const element = document.getElementById(`resident-row-${highlightResidentId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightResidentId]);

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

  const getDatesToDisplay = () => {
    const dates = [];
    if (viewMode === 'MONTH') {
      // Start from 1st of month
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    } else if (viewMode === 'WEEK') {
      // Start from Sunday of current week
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      for (let i = 0; i < 7; i++) {
        dates.push(new Date(start));
        start.setDate(start.getDate() + 1);
      }
    } else {
      // Single day
      dates.push(new Date(currentDate));
    }
    return dates;
  };

  const displayDates = getDatesToDisplay();

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

  const getSchedule = (residentId: string, dateStr: string) => {
    return schedules.filter(s => s.residentId === residentId && s.date === dateStr);
  };

  const getScheduleColor = (type: ResidentSchedule['type']) => {
    switch (type) {
      case 'DAY_CARE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'VISIT': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'HOME': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 pb-20">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-100 shadow-sm z-10">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <div className="bg-orange-100 p-1.5 rounded text-orange-600">
              <Calendar className="w-5 h-5" />
            </div>
            利用予定表
          </h2>
          <button 
            onClick={onImportClick}
            className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 hover:bg-green-100 transition-colors"
          >
            <Upload className="w-3 h-3" /> 取込
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'MONTH' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
            >
              月
            </button>
            <button 
              onClick={() => setViewMode('WEEK')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'WEEK' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
            >
              週
            </button>
            <button 
              onClick={() => setViewMode('DAY')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'DAY' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
            >
              日
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
            <span className="font-bold text-gray-700 text-sm w-24 text-center">
              {viewMode === 'MONTH' && `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`}
              {viewMode === 'WEEK' && `${currentDate.getMonth() + 1}月${displayDates[0].getDate()}日~`}
              {viewMode === 'DAY' && `${currentDate.getMonth() + 1}月${currentDate.getDate()}日`}
            </span>
            <button onClick={handleNext} className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-5 h-5 text-gray-500" /></button>
          </div>
        </div>
      </div>

      {/* Schedule Grid/List */}
      <div className="flex-1 overflow-auto bg-white">
        {viewMode === 'DAY' ? (
          <div className="p-4 space-y-6">
            {residents.map(resident => {
              const daySchedules = getSchedule(resident.id, formatDate(currentDate));
              const isHighlighted = resident.id === highlightResidentId;
              return (
                <div 
                  key={resident.id} 
                  id={`resident-row-${resident.id}`}
                  className={`border rounded-xl overflow-hidden transition-colors duration-500 ${isHighlighted ? 'border-yellow-400 ring-4 ring-yellow-100' : 'border-gray-200'}`}
                >
                  <div className={`p-3 ${resident.avatarColor} text-white flex justify-between items-center`}>
                     <button 
                        onClick={() => onResidentClick(resident.id)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                     >
                       <span className="font-bold">{resident.name}</span>
                       <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Rm.{resident.roomNumber}</span>
                       <ExternalLink className="w-3 h-3" />
                     </button>
                  </div>
                  <div className="p-4 bg-gray-50 min-h-[60px]">
                    {daySchedules.length > 0 ? (
                      daySchedules.map(sch => (
                        <div key={sch.id} className={`mb-2 last:mb-0 p-3 rounded-lg border ${getScheduleColor(sch.type)}`}>
                          <div className="flex justify-between items-start">
                             <span className="font-bold text-sm">{sch.title}</span>
                             {sch.startTime && (
                               <span className="text-xs font-mono font-bold bg-white/50 px-1.5 py-0.5 rounded">
                                 {sch.startTime} {sch.endTime ? `- ${sch.endTime}` : ''}
                               </span>
                             )}
                          </div>
                          {sch.notes && <p className="text-xs mt-1 opacity-80">※ {sch.notes}</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic flex items-center gap-2">
                        <List className="w-4 h-4" /> 予定なし
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="min-w-full inline-block align-middle">
            <div className="border-b border-gray-200">
              {/* Header Row */}
              <div className="flex">
                <div className="flex-none w-24 sm:w-32 p-2 bg-gray-50 font-bold text-xs text-gray-500 border-r border-gray-200 sticky left-0 z-10">
                  利用者名
                </div>
                {displayDates.map(date => (
                  <div 
                    key={date.toString()} 
                    className={`flex-none ${viewMode === 'WEEK' ? 'w-32' : 'w-12'} p-2 border-r border-gray-100 text-center ${formatDate(date) === formatDate(new Date()) ? 'bg-green-50' : ''}`}
                  >
                    <div className={`text-xs font-bold ${date.getDay() === 0 ? 'text-red-500' : date.getDay() === 6 ? 'text-blue-500' : 'text-gray-700'}`}>
                      {date.getDate()}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {['日','月','火','水','木','金','土'][date.getDay()]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Rows */}
              {residents.map(resident => {
                const isHighlighted = resident.id === highlightResidentId;
                return (
                  <div 
                    key={resident.id} 
                    id={`resident-row-${resident.id}`}
                    className={`flex border-b border-gray-100 transition-colors duration-1000 ${isHighlighted ? 'bg-yellow-50' : ''}`}
                  >
                    <div className="flex-none w-24 sm:w-32 p-0 border-r border-gray-200 bg-white sticky left-0 z-10 flex shadow-sm">
                      <button 
                          onClick={() => onResidentClick(resident.id)}
                          className="w-full flex items-center gap-2 p-2 hover:bg-green-50 transition-colors text-left group"
                      >
                          <div className={`w-6 h-6 ${resident.avatarColor} rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            {resident.name[0]}
                          </div>
                          <div className="truncate flex-1">
                            <p className="text-xs font-bold text-gray-800 truncate">{resident.name}</p>
                            <p className="text-[10px] text-gray-400">Rm.{resident.roomNumber}</p>
                          </div>
                      </button>
                    </div>
                    {displayDates.map(date => {
                      const schs = getSchedule(resident.id, formatDate(date));
                      return (
                        <div 
                          key={date.toString()} 
                          className={`flex-none ${viewMode === 'WEEK' ? 'w-32' : 'w-12'} p-1 border-r border-gray-100 relative group`}
                        >
                          {schs.map(sch => (
                            <div 
                              key={sch.id}
                              className={`text-[10px] p-1 rounded mb-1 truncate cursor-pointer hover:opacity-80 ${getScheduleColor(sch.type)}`}
                              title={`${sch.title} ${sch.startTime || ''}`}
                            >
                              {viewMode === 'WEEK' ? (
                                <>
                                  <div className="font-bold truncate">{sch.title}</div>
                                  {sch.startTime && <div className="opacity-75">{sch.startTime}~</div>}
                                </>
                              ) : (
                                <div className="w-full h-3 rounded-full opacity-80"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentScheduleTab;
