
import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskCategory, ChatMessage, Announcement, TaskPriority, Shift, User, Resident, Staff, StockItem, Room, IncidentReport, ResidentSchedule, Todo, CompanyResource } from './types';
import { INITIAL_TASKS, RESIDENTS, INITIAL_MESSAGES, INITIAL_ANNOUNCEMENTS, INITIAL_SHIFTS, STAFF_MEMBERS, INITIAL_STOCK, INITIAL_ROOMS, INITIAL_REPORTS, INITIAL_RESIDENT_SCHEDULES, INITIAL_COMPANY_RESOURCES } from './constants';
import TaskCard from './components/TaskCard';
import AddTaskModal from './components/AddTaskModal';
import ResidentTab from './components/ResidentTab';
import ChatTab from './components/ChatTab';
import ShiftTab from './components/ShiftTab';
import ImportModal from './components/ImportModal';
import SettingsModal from './components/SettingsModal';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import InventoryTab from './components/InventoryTab';
import FacilityMapTab from './components/FacilityMapTab';
import ReportTab from './components/ReportTab';
import ResidentScheduleTab from './components/ResidentScheduleTab';
import StaffTodo from './components/StaffTodo';
import ManualModal from './components/ManualModal';
import { Plus, Calendar, Settings, Sparkles, Loader2, Home, Users, MessageCircle, CheckSquare, FileWarning, Lock, Package, Map, CalendarDays, Filter, UserCircle, AlertTriangle, RotateCw, BookOpen, Search, ArrowRight } from 'lucide-react';
import { generateDailyReport, generateTaskInstructions } from './services/geminiService';

type Tab = 'HOME' | 'TASKS' | 'RESIDENTS' | 'CHAT' | 'SHIFTS' | 'INVENTORY' | 'MAP' | 'REPORTS' | 'PLANS';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>('HOME');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [residentSchedules, setResidentSchedules] = useState<ResidentSchedule[]>(INITIAL_RESIDENT_SCHEDULES);
  const [stockItems, setStockItems] = useState<StockItem[]>(INITIAL_STOCK);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [reports, setReports] = useState<IncidentReport[]>(INITIAL_REPORTS);
  
  // Staff Todo State
  const [todos, setTodos] = useState<Todo[]>([]);

  // Settings State
  const [enableAlerts, setEnableAlerts] = useState(true);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  
  // Task Filter State
  const [taskFilter, setTaskFilter] = useState<string>('ALL');

  // Home Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Master Data State (Editable by Admin)
  const [residentsList, setResidentsList] = useState<Resident[]>(RESIDENTS);
  const [staffList, setStaffList] = useState<Staff[]>(STAFF_MEMBERS);
  const [companyResources, setCompanyResources] = useState<CompanyResource[]>(INITIAL_COMPANY_RESOURCES);

  // Navigation & Selection State (Lifted up)
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [highlightedResidentId, setHighlightedResidentId] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  
  const [dailyReport, setDailyReport] = useState<string>('');
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportScope, setReportScope] = useState<string>('ALL'); // 'ALL' or residentId

  const [isLineConnected, setIsLineConnected] = useState(false);
  
  // Audio ref for alarm
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load data from local storage
  useEffect(() => {
    const savedUser = sessionStorage.getItem('careSyncUser');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const savedTasks = localStorage.getItem('careSyncTasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    
    const savedTodos = localStorage.getItem('careSyncTodos');
    if (savedTodos) setTodos(JSON.parse(savedTodos));

    const savedMessages = localStorage.getItem('careSyncMessages');
    if (savedMessages) setMessages(JSON.parse(savedMessages));

    const savedLineStatus = localStorage.getItem('careSyncLineConnected');
    if (savedLineStatus) setIsLineConnected(JSON.parse(savedLineStatus));
    
    const savedAlertSettings = localStorage.getItem('careSyncEnableAlerts');
    if (savedAlertSettings) setEnableAlerts(JSON.parse(savedAlertSettings));
    
    const savedShifts = localStorage.getItem('careSyncShifts');
    if (savedShifts) setShifts(JSON.parse(savedShifts));
    
    const savedResidentSchedules = localStorage.getItem('careSyncResidentSchedules');
    if (savedResidentSchedules) setResidentSchedules(JSON.parse(savedResidentSchedules));
    
    const savedStock = localStorage.getItem('careSyncStock');
    if (savedStock) setStockItems(JSON.parse(savedStock));

    const savedRooms = localStorage.getItem('careSyncRooms');
    if (savedRooms) setRooms(JSON.parse(savedRooms));

    const savedReports = localStorage.getItem('careSyncReports');
    if (savedReports) setReports(JSON.parse(savedReports));

    const savedResidents = localStorage.getItem('careSyncResidents');
    if (savedResidents) setResidentsList(JSON.parse(savedResidents));
    
    const savedStaff = localStorage.getItem('careSyncStaff');
    if (savedStaff) setStaffList(JSON.parse(savedStaff));

    const savedCompanyResources = localStorage.getItem('careSyncCompanyResources');
    if (savedCompanyResources) setCompanyResources(JSON.parse(savedCompanyResources));

    // Initialize audio
    alarmAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Simple beep
    if (alarmAudioRef.current) {
        alarmAudioRef.current.volume = 0.5;
    }

  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('careSyncTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('careSyncTodos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('careSyncMessages', JSON.stringify(messages));
  }, [messages]);
  
  useEffect(() => {
    localStorage.setItem('careSyncLineConnected', JSON.stringify(isLineConnected));
  }, [isLineConnected]);

  useEffect(() => {
    localStorage.setItem('careSyncEnableAlerts', JSON.stringify(enableAlerts));
  }, [enableAlerts]);
  
  useEffect(() => {
    localStorage.setItem('careSyncShifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('careSyncResidentSchedules', JSON.stringify(residentSchedules));
  }, [residentSchedules]);

  useEffect(() => {
    localStorage.setItem('careSyncStock', JSON.stringify(stockItems));
  }, [stockItems]);

  useEffect(() => {
    localStorage.setItem('careSyncRooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('careSyncReports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('careSyncResidents', JSON.stringify(residentsList));
  }, [residentsList]);
  
  useEffect(() => {
    localStorage.setItem('careSyncStaff', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('careSyncCompanyResources', JSON.stringify(companyResources));
  }, [companyResources]);

  // Check for overdue tasks every minute
  useEffect(() => {
    const checkOverdue = () => {
      if (!enableAlerts) {
        setOverdueTasks([]);
        return;
      }

      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      
      const overdue = tasks.filter(t => {
        if (t.isCompleted) return false;
        const [tHour, tMinute] = t.time.split(':').map(Number);
        
        // Simple comparison: if task time is strictly in the past (by minute)
        if (currentHours > tHour) return true;
        if (currentHours === tHour && currentMinutes > tMinute) return true;
        return false;
      });

      // If new overdue tasks found that weren't there before, play sound
      if (overdue.length > 0 && overdue.length > overdueTasks.length) {
        // Try play sound (user interaction usually required first, but this will try)
        alarmAudioRef.current?.play().catch(e => console.log("Audio play failed (user interaction needed)", e));
      }

      setOverdueTasks(overdue);
    };

    checkOverdue(); // Check on mount/update
    const interval = setInterval(checkOverdue, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [tasks, enableAlerts, overdueTasks.length]);


  const handleLogin = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('careSyncUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('careSyncUser');
    setIsSettingsOpen(false);
    setShowAdminDashboard(false);
  };

  const addTask = (newTaskData: Omit<Task, 'id' | 'isCompleted'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: Date.now().toString(),
      isCompleted: false,
    };
    setTasks(prev => [...prev, newTask].sort((a, b) => a.time.localeCompare(b.time)));
    setActiveTab('TASKS');
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? new Date().toISOString() : undefined } : t
    ));
  };

  // Todo Handlers
  const handleAddTodo = (text: string) => {
    if (!currentUser) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      content: text,
      isCompleted: false,
      staffId: currentUser.id,
      createdAt: new Date().toISOString()
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleSendMessage = (text: string, file?: File) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderName: currentUser?.name || 'スタッフ',
      content: text,
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      type: file ? (file.type.startsWith('video') ? 'video' : 'image') : 'text',
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        newMsg.mediaUrl = e.target?.result as string;
        setMessages(prev => [...prev, newMsg]);
      };
      reader.readAsDataURL(file);
    } else {
      setMessages(prev => [...prev, newMsg]);
    }
  };
  
  const handleUpdateShift = (updatedShift: Shift) => {
    setShifts(prev => {
      const exists = prev.some(s => s.date === updatedShift.date);
      if (exists) {
        return prev.map(s => s.date === updatedShift.date ? updatedShift : s);
      }
      return [...prev, updatedShift];
    });
  };

  const handleUpdateResident = (updatedResident: Resident) => {
    setResidentsList(prev => prev.map(r => r.id === updatedResident.id ? updatedResident : r));
    if (selectedResident?.id === updatedResident.id) {
      setSelectedResident(updatedResident);
    }
  };

  const handleUpdateStock = (updatedItem: StockItem) => {
    setStockItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleUpdateRoom = (updatedRoom: Room) => {
    setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
  };

  const handleAddReport = (newReport: IncidentReport) => {
    setReports(prev => [newReport, ...prev]);
  };

  const handleUpdateCompanyResource = (updatedResource: CompanyResource) => {
    setCompanyResources(prev => prev.map(r => r.id === updatedResource.id ? updatedResource : r));
  };

  const handleMarkReportAsRead = (reportId: string) => {
    if (!currentUser) return;
    setReports(prev => prev.map(report => {
      if (report.id === reportId && !report.readByStaffIds.includes(currentUser.id)) {
        return { ...report, readByStaffIds: [...report.readByStaffIds, currentUser.id] };
      }
      return report;
    }));
  };

  const generateReport = async (scope: string) => {
    setIsReportLoading(true);
    try {
      const targetResident = residentsList.find(r => r.id === scope);
      const scopeTasks = tasks.filter(t => {
          if (!t.isCompleted) return false;
          if (scope === 'ALL') return true;
          return t.residentId === scope || !t.residentId; 
      });
      
      const report = await generateDailyReport(scopeTasks, residentsList, targetResident);
      setDailyReport(report);
    } finally {
      setIsReportLoading(false);
    }
  };

  const handleOpenReportModal = () => {
    setReportScope('ALL');
    setShowReportModal(true);
    generateReport('ALL');
  };
  
  const handleShareToLine = () => {
    if (!dailyReport) return;
    const url = `https://line.me/R/msg/text/?${encodeURIComponent(dailyReport)}`;
    window.open(url, '_blank');
  };

  const handleImportSchedule = (fileName: string, type?: 'STAFF_SHIFT' | 'RESIDENT_SCHEDULE', parsedData?: Shift[]) => {
    if (type === 'RESIDENT_SCHEDULE') {
      const newSchedules: ResidentSchedule[] = [
        { id: Date.now() + '1', residentId: 'r1', date: new Date().toISOString().split('T')[0], title: '生活介護（インポート）', type: 'DAY_CARE', startTime: '09:00', endTime: '16:00' },
        { id: Date.now() + '2', residentId: 'r2', date: new Date().toISOString().split('T')[0], title: '通院（インポート）', type: 'VISIT', startTime: '10:30', notes: '詳細確認' }
      ];
      setResidentSchedules(prev => [...prev, ...newSchedules]);
      setActiveTab('PLANS');
    } else if (type === 'STAFF_SHIFT' && parsedData) {
      // Merge new shifts
      setShifts(prev => {
        const newDates = parsedData.map(s => s.date);
        const filteredPrev = prev.filter(s => !newDates.includes(s.date));
        return [...filteredPrev, ...parsedData];
      });
      setActiveTab('SHIFTS');
    } else {
      const newTasks: Task[] = [
        {
          id: Date.now().toString() + '1',
          time: '13:00',
          title: '【インポート】午後の定期巡回',
          description: `${fileName} から取り込みました。各居室の換気を行ってください。`,
          category: TaskCategory.ADMIN,
          priority: TaskPriority.MEDIUM,
          isCompleted: false
        },
        {
          id: Date.now().toString() + '2',
          time: '15:00',
          title: '【インポート】おやつ対応',
          description: `${fileName} から取り込みました。102号室佐藤様はゼリー食です。`,
          category: TaskCategory.MEAL,
          priority: TaskPriority.HIGH,
          isCompleted: false,
          residentId: 'r2'
        }
      ];
      setTasks(prev => [...prev, ...newTasks].sort((a, b) => a.time.localeCompare(b.time)));
      setActiveTab('TASKS');
    }
    setIsImportModalOpen(false);
  };

  const handleGenerateAiGuide = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let residentContext = "";
    if (task.residentId) {
      const r = residentsList.find(res => res.id === task.residentId);
      if (r) {
        residentContext = `Name: ${r.name}, Assessment/Needs: ${r.assessment}`;
      }
    }

    try {
      const instructions = await generateTaskInstructions(task.title, task.time, residentContext);
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, aiGeneratedInstructions: instructions } : t
      ));
    } catch (error) {
      console.error("Failed to generate instructions", error);
    }
  };

  // Navigation Handlers
  const handleNavigateToResident = (residentId: string) => {
    const resident = residentsList.find(r => r.id === residentId);
    if (resident) {
      setSelectedResident(resident);
      setActiveTab('RESIDENTS');
    }
  };

  const handleNavigateToSchedule = (residentId?: string) => {
    if (residentId) {
      setHighlightedResidentId(residentId);
      setTimeout(() => setHighlightedResidentId(null), 3000);
    }
    setSelectedResident(null);
    setActiveTab('PLANS');
  };

  // Search Filtering Logic
  const searchResults = searchQuery ? {
    residents: residentsList.filter(r => r.name.includes(searchQuery) || r.roomNumber.includes(searchQuery)),
    tasks: tasks.filter(t => t.title.includes(searchQuery) || t.description.includes(searchQuery))
  } : null;


  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  const unreadReportsCount = currentUser ? reports.filter(r => !r.readByStaffIds.includes(currentUser.id)).length : 0;
  const lowStockCount = stockItems.filter(item => item.quantity <= item.threshold).length;

  // Filter logic for tasks
  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'ALL') return true;
    return t.residentId === taskFilter || !t.residentId;
  });

  // RENDER: Login Screen
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // RENDER: Admin Dashboard
  if (showAdminDashboard) {
    return (
      <AdminDashboard 
        residents={residentsList}
        staffMembers={staffList}
        onClose={() => setShowAdminDashboard(false)}
        onUpdateResidents={setResidentsList}
        onUpdateStaff={setStaffList}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    {/* Updated Chibizu Logo (Calico Cat) */}
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-green-200 shadow-lg overflow-hidden">
                         <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill="none" xmlns="http://www.w3.org/2000/svg">
                           {/* Ears */}
                           <path d="M 15 35 L 10 10 L 40 25 Z" fill="#FB923C" stroke="white" strokeWidth="3" strokeLinejoin="round" />
                           <path d="M 85 35 L 90 10 L 60 25 Z" fill="#374151" stroke="white" strokeWidth="3" strokeLinejoin="round" />
                           
                           {/* Face Base */}
                           <circle cx="50" cy="55" r="40" fill="white" stroke="white" strokeWidth="2" />
                           
                           {/* Patches */}
                           <path d="M 13 40 Q 20 20 50 20 L 30 55 Z" fill="#FB923C" />
                           <path d="M 87 40 Q 80 20 50 20 L 70 55 Z" fill="#374151" />
                           
                           {/* Eyes */}
                           <circle cx="35" cy="52" r="4" fill="black" />
                           <circle cx="65" cy="52" r="4" fill="black" />
                           
                           {/* Mouth */}
                           <path d="M 50 67 Q 42 75 35 68" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                           <path d="M 50 67 Q 58 75 65 68" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                         </svg>
                    </div>
                    <h1 className="text-lg font-bold text-gray-800 tracking-tight">GHちびずアプリ</h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right mr-1 hidden sm:block">
                        <p className="text-xs font-bold text-gray-700">{currentUser.name}</p>
                    </div>
                    <button 
                    onClick={() => {
                        const confirmCall = window.confirm("【緊急連絡】\n管理者に発信しますか？\n\n誤操作防止のため確認しています。");
                        if (confirmCall) window.location.href = "tel:09000000000"; 
                    }}
                    className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-full transition-colors font-bold text-xs flex items-center gap-1 border border-red-100"
                    >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">緊急連絡</span>
                    </button>
                    <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 text-gray-400 hover:bg-gray-50 rounded-full hover:text-gray-600 transition-colors"
                    >
                    <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            {/* Search Bar (Visible on HOME) */}
            {activeTab === 'HOME' && (
                <div className="relative mb-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="利用者名、タスクなどを検索..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                            <ArrowRight className="w-4 h-4 transform rotate-45" />
                        </button>
                    )}
                </div>
            )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 pb-24">
        
        {/* HOME TAB */}
        {activeTab === 'HOME' && (
          <div className="space-y-6 animate-fadeIn">
            
            {searchQuery ? (
                // SEARCH RESULTS VIEW
                <div className="space-y-4">
                    <h2 className="font-bold text-gray-800">検索結果</h2>
                    
                    {/* Residents Matches */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase">利用者</h3>
                        {searchResults?.residents.length ? (
                            searchResults.residents.map(r => (
                                <div 
                                    key={r.id}
                                    onClick={() => {
                                        setSelectedResident(r);
                                        setActiveTab('RESIDENTS');
                                    }}
                                    className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-green-50"
                                >
                                    <div className={`w-10 h-10 ${r.avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>{r.name[0]}</div>
                                    <div>
                                        <p className="font-bold text-gray-800">{r.name}</p>
                                        <p className="text-xs text-gray-500">Rm.{r.roomNumber}</p>
                                    </div>
                                    <ArrowRight className="ml-auto w-4 h-4 text-gray-300" />
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 pl-2">一致する利用者は見つかりませんでした</p>
                        )}
                    </div>

                    {/* Tasks Matches */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase">業務・タスク</h3>
                         {searchResults?.tasks.length ? (
                            searchResults.tasks.map(t => (
                                <TaskCard 
                                    key={t.id} 
                                    task={t}
                                    resident={t.residentId ? residentsList.find(r => r.id === t.residentId) : undefined}
                                    onToggleComplete={toggleTaskCompletion}
                                />
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 pl-2">一致するタスクは見つかりませんでした</p>
                        )}
                    </div>
                </div>
            ) : (
                // NORMAL DASHBOARD VIEW
                <>
                    {/* Task Alert Banner */}
                    {overdueTasks.length > 0 && (
                    <button 
                        onClick={() => setActiveTab('TASKS')}
                        className="w-full bg-red-500 text-white p-3 rounded-xl shadow-lg flex items-center justify-between animate-pulse"
                    >
                        <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 fill-white text-red-500" />
                        <div className="text-left">
                            <p className="text-sm font-bold">予定時間を過ぎたタスクがあります</p>
                            <p className="text-xs opacity-90">未完了: {overdueTasks.length}件</p>
                        </div>
                        </div>
                        <span className="text-xs font-bold bg-white text-red-600 px-3 py-1 rounded-full">確認</span>
                    </button>
                    )}

                    {/* Low Stock Alert */}
                    {lowStockCount > 0 && (
                    <button 
                        onClick={() => setActiveTab('INVENTORY')}
                        className="w-full bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center justify-between group hover:bg-orange-100 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                        <div className="bg-orange-500 text-white p-2 rounded-full animate-pulse">
                            <Package className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-orange-800">在庫不足のアイテムがあります</p>
                            <p className="text-xs text-orange-600">{lowStockCount}件の発注が必要です</p>
                        </div>
                        </div>
                        <span className="text-xs font-bold bg-white text-orange-600 px-3 py-1 rounded-full shadow-sm group-hover:scale-105 transition-transform">確認</span>
                    </button>
                    )}

                    {/* Progress Card */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-gray-500 text-sm font-bold mb-1">本日の進捗</h2>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-3xl font-bold text-gray-800">{Math.round(progress)}%</span>
                        <span className="text-sm text-gray-400">{completedCount} / {tasks.length} タスク完了</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                    </div>

                    {/* Staff Personal Todo */}
                    <StaffTodo 
                    todos={todos}
                    currentUser={currentUser}
                    onAddTodo={handleAddTodo}
                    onToggleTodo={handleToggleTodo}
                    onDeleteTodo={handleDeleteTodo}
                    />

                    {/* Notifications / Reports Alert */}
                    {unreadReportsCount > 0 && (
                    <button 
                        onClick={() => setActiveTab('REPORTS')}
                        className="w-full bg-red-50 border border-red-100 p-4 rounded-xl flex items-center justify-between group hover:bg-red-100 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                        <div className="bg-red-500 text-white p-2 rounded-full animate-pulse">
                            <FileWarning className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-red-800">未確認の報告書があります</p>
                            <p className="text-xs text-red-600">ヒヤリハット・事故報告: {unreadReportsCount}件</p>
                        </div>
                        </div>
                        <span className="text-xs font-bold bg-white text-red-600 px-3 py-1 rounded-full shadow-sm group-hover:scale-105 transition-transform">確認する</span>
                    </button>
                    )}

                    {/* Announcements */}
                    <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="bg-orange-100 p-1.5 rounded-full">
                        <FileWarning className="w-4 h-4 text-orange-600" />
                        </div>
                        <h2 className="font-bold text-gray-800">お知らせ</h2>
                    </div>
                    <div className="space-y-3">
                        {announcements.map(ann => (
                        <div key={ann.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${ann.isImportant ? 'border-red-500' : 'border-blue-400'}`}>
                            <div className="flex justify-between items-start mb-1">
                            {ann.isImportant && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">重要</span>}
                            <span className="text-xs text-gray-400 ml-auto">{ann.date}</span>
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm mb-1">{ann.title}</h3>
                            <p className="text-xs text-gray-600">{ann.content}</p>
                        </div>
                        ))}
                    </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <button 
                        onClick={handleOpenReportModal} 
                        className="bg-purple-50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-purple-100 hover:bg-purple-100 transition-colors group"
                    >
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-purple-900 text-sm">日誌自動作成</span>
                    </button>
                    
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-emerald-50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-emerald-100 hover:bg-emerald-100 transition-colors group"
                    >
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <Plus className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-emerald-900 text-sm">タスク追加</span>
                    </button>

                    {/* Shift Shortcut */}
                    <button 
                        onClick={() => setActiveTab('SHIFTS')}
                        className="bg-orange-50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-orange-100 hover:bg-orange-100 transition-colors group"
                    >
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                        <Calendar className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-orange-900 text-sm">シフト管理画面</span>
                    </button>
                    
                    {/* Inventory Shortcut */}
                    <button 
                        onClick={() => setActiveTab('INVENTORY')}
                        className="bg-green-50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-green-100 hover:bg-green-100 transition-colors group"
                    >
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                        <Package className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-green-900 text-sm">在庫管理・発注</span>
                    </button>

                    {/* Manual Shortcut */}
                    <button 
                        onClick={() => setIsManualModalOpen(true)}
                        className="bg-teal-50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-teal-100 hover:bg-teal-100 transition-colors group sm:col-span-2 md:col-span-1"
                    >
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-teal-900 text-sm">マニュアル・理念</span>
                    </button>
                    </div>
                </>
            )}
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'TASKS' && (
          <div className="animate-fadeIn">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex justify-between items-end">
                <h2 className="text-xl font-bold text-gray-800">業務タイムライン</h2>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{filteredTasks.length}件</span>
              </div>
              
              {/* Resident Filter */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                <button
                  onClick={() => setTaskFilter('ALL')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    taskFilter === 'ALL' 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  全員
                </button>
                {residentsList.map(resident => (
                  <button
                    key={resident.id}
                    onClick={() => setTaskFilter(resident.id)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                      taskFilter === resident.id 
                        ? `bg-green-600 text-white shadow-md` 
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${resident.avatarColor} border border-white`}></div>
                    {resident.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    resident={task.residentId ? residentsList.find(r => r.id === task.residentId) : undefined}
                    onToggleComplete={toggleTaskCompletion}
                    onGenerateAiGuide={handleGenerateAiGuide}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                  <CheckSquare className="w-12 h-12 text-gray-300 mb-2" />
                  <p>表示するタスクがありません</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* SHIFTS TAB */}
        {activeTab === 'SHIFTS' && (
          <div className="animate-fadeIn">
            <ShiftTab 
              shifts={shifts} 
              onUpdateShift={handleUpdateShift}
              onImportClick={() => setIsImportModalOpen(true)} 
            />
          </div>
        )}

        {/* PLANS (RESIDENT SCHEDULE) TAB */}
        {activeTab === 'PLANS' && (
          <div className="animate-fadeIn h-full">
            <ResidentScheduleTab 
              residents={residentsList}
              schedules={residentSchedules}
              onImportClick={() => setIsImportModalOpen(true)}
              onResidentClick={handleNavigateToResident}
              highlightResidentId={highlightedResidentId}
            />
          </div>
        )}

        {/* RESIDENTS TAB */}
        {activeTab === 'RESIDENTS' && (
          <div className="animate-fadeIn">
            <ResidentTab 
              residents={residentsList} 
              onUpdateResident={handleUpdateResident}
              selectedResident={selectedResident}
              onSelectResident={setSelectedResident}
              onViewSchedule={handleNavigateToSchedule}
            />
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'INVENTORY' && (
           <div className="animate-fadeIn">
             <InventoryTab 
               stockItems={stockItems} 
               onUpdateStock={handleUpdateStock} 
             />
           </div>
        )}

        {/* MAP TAB */}
        {activeTab === 'MAP' && (
          <div className="animate-fadeIn h-full">
             <FacilityMapTab 
               rooms={rooms}
               residents={residentsList}
               onUpdateRoom={handleUpdateRoom}
             />
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'REPORTS' && (
          <div className="animate-fadeIn h-full">
            <ReportTab 
              reports={reports}
              currentUser={currentUser}
              onAddReport={handleAddReport}
              onMarkAsRead={handleMarkReportAsRead}
            />
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'CHAT' && (
          <div className="animate-fadeIn">
             <ChatTab 
               messages={messages} 
               onSendMessage={handleSendMessage} 
               currentUser={currentUser}
               isLineConnected={isLineConnected}
             />
          </div>
        )}

      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 pb-safe z-40">
        <div className="max-w-3xl mx-auto flex justify-around items-center h-16 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('HOME')}
            className={`flex flex-col items-center gap-1 w-16 h-full justify-center flex-shrink-0 ${activeTab === 'HOME' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">ホーム</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('TASKS')}
            className={`flex flex-col items-center gap-1 w-16 h-full justify-center flex-shrink-0 ${activeTab === 'TASKS' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <CheckSquare className="w-6 h-6" />
            <span className="text-[10px] font-medium">業務</span>
          </button>

          <button 
            onClick={() => setActiveTab('PLANS')}
            className={`flex flex-col items-center gap-1 w-16 h-full justify-center flex-shrink-0 ${activeTab === 'PLANS' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <CalendarDays className="w-6 h-6" />
            <span className="text-[10px] font-medium">予定</span>
          </button>

          {/* Center Action Button (Create) - Floating style but inline for scroll safety */}
          <div className="relative -top-5 w-14 h-14 flex-shrink-0 mx-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-14 h-14 bg-green-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-green-700 active:scale-90 transition-all"
            >
              <Plus className="w-7 h-7" />
            </button>
          </div>

           <button 
            onClick={() => setActiveTab('REPORTS')}
            className={`flex flex-col items-center gap-1 w-16 h-full justify-center flex-shrink-0 relative ${activeTab === 'REPORTS' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {unreadReportsCount > 0 && (
              <span className="absolute top-1 right-4 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
            <FileWarning className="w-6 h-6" />
            <span className="text-[10px] font-medium">報告書</span>
          </button>

          <button 
            onClick={() => setActiveTab('RESIDENTS')}
            className={`flex flex-col items-center gap-1 w-16 h-full justify-center flex-shrink-0 ${activeTab === 'RESIDENTS' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-medium">入居者</span>
          </button>

           <button 
            onClick={() => setActiveTab('CHAT')}
            className={`flex flex-col items-center gap-1 w-16 h-full justify-center flex-shrink-0 ${activeTab === 'CHAT' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-[10px] font-medium">連絡</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addTask} 
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenAdmin={() => setShowAdminDashboard(true)}
        onLogout={handleLogout}
        isLineConnected={isLineConnected}
        onToggleLine={() => setIsLineConnected(!isLineConnected)}
        userRole={currentUser.role}
        enableAlerts={enableAlerts}
        onToggleAlerts={() => setEnableAlerts(!enableAlerts)}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSchedule={handleImportSchedule}
      />

      <ManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        resources={companyResources}
        onUpdateResource={handleUpdateCompanyResource}
      />

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-popIn flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI 日誌作成
              </h3>
              <button onClick={() => setShowReportModal(false)}><Settings className="w-5 h-5 text-gray-400" /></button>
            </div>
            
            {/* Scope Selector */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">作成対象</label>
              <select
                value={reportScope}
                onChange={(e) => {
                  setReportScope(e.target.value);
                  generateReport(e.target.value);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none"
                disabled={isReportLoading}
              >
                <option value="ALL">全員・全体共有 (申し送り)</option>
                <optgroup label="利用者別 (ケース記録)">
                  {residentsList.map(r => (
                    <option key={r.id} value={r.id}>{r.name} 様</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 min-h-[200px] text-sm leading-relaxed text-gray-700 whitespace-pre-wrap border border-gray-200 overflow-y-auto flex-1">
              {isReportLoading ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p>完了済みタスクから日誌を生成中...</p>
                </div>
              ) : (
                dailyReport || <p className="text-gray-400 text-center py-10">完了したタスクがありません。</p>
              )}
            </div>
            
            {/* Regeneration Button inside modal */}
             <div className="flex justify-end mt-2">
                 <button 
                   onClick={() => generateReport(reportScope)}
                   disabled={isReportLoading}
                   className="text-xs text-purple-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                 >
                   <RotateCw className="w-3 h-3" /> 再生成
                 </button>
             </div>

            <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100">
               <button 
                onClick={() => setShowReportModal(false)}
                className="text-gray-500 font-medium hover:text-gray-700 px-3"
              >
                閉じる
              </button>
              <button
                onClick={handleShareToLine}
                className={`flex items-center gap-2 bg-[#06C755] text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-[#05b34c] transition-colors ${!dailyReport ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!dailyReport}
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                LINEで送る
              </button>
              <button 
                onClick={() => {
                   navigator.clipboard.writeText(dailyReport);
                   alert("コピーしました");
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
              >
                コピー
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
