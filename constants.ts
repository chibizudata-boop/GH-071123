
import { TaskCategory, TaskPriority, Resident, ChatMessage, Announcement, Staff, Shift, StockItem, EmergencyContact, Room, IncidentReport, ResidentSchedule, CompanyResource, HealthRecord } from './types';
import { Utensils, Pill, Bath, Users, FileText, HelpCircle } from 'lucide-react';

export const CATEGORY_CONFIG: Record<TaskCategory, { label: string; color: string; icon: any }> = {
  [TaskCategory.MEAL]: { label: '食事介助', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Utensils },
  [TaskCategory.MEDICATION]: { label: '服薬管理', color: 'bg-red-100 text-red-700 border-red-200', icon: Pill },
  [TaskCategory.HYGIENE]: { label: '入浴・排泄', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Bath },
  [TaskCategory.ACTIVITY]: { label: '日中活動', color: 'bg-green-100 text-green-700 border-green-200', icon: Users },
  [TaskCategory.ADMIN]: { label: '事務・記録', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText },
  [TaskCategory.OTHER]: { label: 'その他', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: HelpCircle },
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: '低',
  [TaskPriority.MEDIUM]: '中',
  [TaskPriority.HIGH]: '高',
  [TaskPriority.URGENT]: '緊急',
};

// 認証情報（モック）
export const AUTH_CREDENTIALS = {
  ADMIN: { id: 'GH000', pass: '0000', name: '佐々木 (管理者)', role: 'manager' as const },
  STAFF: { id: 'staff', pass: 'staff123', name: '山田 (スタッフ)', role: 'staff' as const }
};

// スタッフデータ
export const STAFF_MEMBERS: Staff[] = [
  { id: 's1', name: '佐々木 (管理者)', role: 'manager', loginId: 'GH000' },
  { id: 's2', name: '山田 (スタッフ)', role: 'staff', loginId: 'staff1' },
  { id: 's3', name: '鈴木 (スタッフ)', role: 'staff', loginId: 'staff2' },
  { id: 's4', name: '高橋 (スタッフ)', role: 'staff', loginId: 'staff3' },
  { id: 's5', name: '佐藤 (看護師)', role: 'nurse', loginId: 'nurse1' },
];

// 今日の日付を取得
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const dateStr = `${yyyy}-${mm}-${dd}`;

// Generate mock health records for graphing
const generateMockHealthRecords = (): HealthRecord[] => {
  const records: HealthRecord[] = [];
  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    
    records.push({
      id: `hr_${i}`,
      date: dStr,
      time: '09:00',
      weight: i % 7 === 0 ? 62.0 + (Math.random() * 1 - 0.5) : undefined, // Weight once a week
      temperature: 36.3 + (Math.random() * 0.5),
      systolicBP: 120 + Math.floor(Math.random() * 20 - 10),
      diastolicBP: 75 + Math.floor(Math.random() * 10 - 5),
      pulse: 70 + Math.floor(Math.random() * 10 - 5),
      spo2: 97 + Math.floor(Math.random() * 2),
      respiration: 16 + Math.floor(Math.random() * 4 - 2),
      notes: ''
    });
  }
  return records;
};

const MOCK_HEALTH_RECORDS = generateMockHealthRecords();

// 4名の入居者データ
export const RESIDENTS: Resident[] = [
  {
    id: 'r1',
    name: '田中 健一',
    roomNumber: '101',
    age: 45,
    birthDate: '1978-05-15',
    bloodType: 'A',
    diagnosis: '脳出血後遺症',
    currentWeight: 62.5,
    disabilityLevel: '区分4',
    assessment: '左片麻痺あり。嚥下機能低下のため刻み食・とろみ必須。',
    carePlan: '自立歩行の維持、誤嚥性肺炎の予防。',
    avatarColor: 'bg-blue-500',
    files: [
      { id: 'f1', name: '個別支援計画書.pdf', type: 'pdf', url: '#', date: '2023-09-01' },
      { id: 'f2', name: '保険証写し.jpg', type: 'image', url: 'https://placehold.co/300x200/e2e8f0/64748b?text=Insurance+Card', date: '2023-04-01', albumId: 'a1_1', description: '保険証のコピー' }
    ],
    albums: [
      { id: 'a1_1', title: '重要書類・証書', residentId: 'r1', createdAt: '2023-01-01' },
      { id: 'a1_2', title: 'リハビリの様子', residentId: 'r1', createdAt: '2023-05-15' }
    ],
    belongings: [],
    healthRecords: MOCK_HEALTH_RECORDS
  },
  {
    id: 'r2',
    name: '佐藤 花子',
    roomNumber: '102',
    age: 32,
    birthDate: '1991-11-22',
    bloodType: 'O',
    diagnosis: '知的障害（中度）、てんかん',
    currentWeight: 48.0,
    disabilityLevel: '区分3',
    assessment: '知的障害（中度）。てんかん発作の既往あり。服薬への拒否感が時折ある。',
    carePlan: '規則正しい生活リズムの確立、服薬コンプライアンスの向上。',
    avatarColor: 'bg-pink-500',
    files: [
      { id: 'f3', name: '発作時対応マニュアル.xlsx', type: 'excel', url: '#', date: '2023-08-15' }
    ],
    albums: [
      { id: 'a2_1', title: 'イベント写真', residentId: 'r2', createdAt: '2023-04-01' },
      { id: 'a2_2', title: '発作時の記録（動画）', residentId: 'r2', createdAt: '2023-09-01' }
    ],
    belongings: [
      { id: 'b1', name: '腕時計', description: 'ピンク色のG-SHOCK', registeredDate: '2023-01-15' },
      { id: 'b2', name: 'タブレット', description: 'iPad mini (ケース付き)', registeredDate: '2023-01-15' }
    ],
    healthRecords: []
  },
  {
    id: 'r3',
    name: '鈴木 一郎',
    roomNumber: '103',
    age: 58,
    birthDate: '1965-03-10',
    bloodType: 'B',
    diagnosis: '自閉症スペクトラム',
    currentWeight: 71.2,
    disabilityLevel: '区分5',
    assessment: '自閉症スペクトラム。大きな音や急な予定変更パニックになりやすい。こだわり行動あり。',
    carePlan: '安心できる環境設定、視覚的支援を用いたスケジュール管理。',
    avatarColor: 'bg-green-500',
    files: [],
    albums: [],
    belongings: [],
    healthRecords: []
  },
  {
    id: 'r4',
    name: '高橋 優子',
    roomNumber: '104',
    age: 29,
    birthDate: '1994-08-30',
    bloodType: 'AB',
    diagnosis: '統合失調症',
    currentWeight: 54.5,
    disabilityLevel: '区分2',
    assessment: '精神障害（統合失調症）。現在は安定しているが、夜間の不眠傾向あり。',
    carePlan: '就労継続支援B型への安定通所、金銭管理の自立支援。',
    avatarColor: 'bg-yellow-500',
    files: [
      { id: 'f4', name: '就労先連絡先一覧.pdf', type: 'pdf', url: '#', date: '2023-10-01' }
    ],
    albums: [],
    belongings: [],
    healthRecords: []
  }
];

export const INITIAL_TASKS = [
  {
    id: '1',
    time: '07:00',
    title: '朝食準備・介助',
    description: '田中さん（101）はとろみを忘れずに。',
    category: TaskCategory.MEAL,
    priority: TaskPriority.HIGH,
    isCompleted: false,
    residentId: 'r1'
  },
  {
    id: '2',
    time: '08:00',
    title: '朝の服薬確認',
    description: '佐藤さん（102）、確実に嚥下したか確認すること。',
    category: TaskCategory.MEDICATION,
    priority: TaskPriority.URGENT,
    isCompleted: false,
    residentId: 'r2'
  },
  {
    id: '3',
    time: '10:00',
    title: '散歩・レクリエーション',
    description: '全員で近所の公園へ。鈴木さん（103）はイヤーマフを持参。',
    category: TaskCategory.ACTIVITY,
    priority: TaskPriority.MEDIUM,
    isCompleted: false,
  }
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    senderName: '佐々木 (管理者)',
    content: 'お疲れ様です。本日の夜勤は私が担当します。引き継ぎ事項あれば共有お願いします。',
    timestamp: '16:30',
    type: 'text'
  },
  {
    id: 'm2',
    senderName: '山田 (スタッフ)',
    content: '103号室の鈴木さんが帰宅時に少し落ち着かない様子でした。クールダウン済みです。',
    timestamp: '16:45',
    type: 'text'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: '【重要】来週の避難訓練について',
    content: '10月15日（水）14:00より避難訓練を実施します。夜勤スタッフも含め確認をお願いします。',
    date: '2023-10-10',
    isImportant: true
  },
  {
    id: 'a2',
    title: 'インフルエンザ予防接種の調査票',
    content: '利用者様のご家族宛に送付済みです。回収状況の確認をお願いします。',
    date: '2023-10-08',
    isImportant: false
  }
];

export const INITIAL_COMPANY_RESOURCES: CompanyResource[] = [
  {
    id: 'c1',
    title: 'グループホーム「ちびず」理念',
    category: 'PHILOSOPHY',
    content: '# 理念\n「自分らしく、安心して暮らせる家」\n\n# 行動指針\n1. 利用者様の意思決定を尊重します。\n2. 安全で快適な環境を提供します。\n3. 地域社会とのつながりを大切にします。',
    lastUpdated: '2023-04-01',
    files: []
  },
  {
    id: 'c2',
    title: 'リフト使用マニュアル',
    category: 'MANUAL_CARE',
    content: '# リフト使用手順\n1. **スリングシートの装着**: 利用者様の体格に合ったサイズを選び、背中から大腿部までしっかりと覆うように装着します。\n2. **ハンガーへのフック**: シートのストラップをハンガーに確実にフックします。交差させないように注意。\n3. **上昇**: 声かけを行いながら、ゆっくりと上昇させます。足が床から離れたら一旦停止し、安定確認。\n4. **移動・下降**: 揺らさないように移動し、着座位置を確認しながら下降します。',
    lastUpdated: '2023-09-10',
    files: []
  },
  {
    id: 'c3',
    title: 'オムツ交換手順（基本）',
    category: 'MANUAL_CARE',
    content: '# オムツ交換の基本\n\n- プライバシーに配慮し、カーテンやドアを閉める。\n- 声かけを忘れずに行う。\n- 陰部洗浄は前から後ろへ。\n- テープは締め付けすぎず、指一本入る程度に。',
    lastUpdated: '2023-08-20',
    files: []
  }
];

export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 's1',
    date: dateStr,
    dayStaffId: 's2', // 山田
    nightStaffId: 's1' // 佐々木
  }
];

// Generate some mock resident schedules
export const INITIAL_RESIDENT_SCHEDULES: ResidentSchedule[] = [
  { id: 'rs1', residentId: 'r1', date: dateStr, title: '生活介護（A事業所）', type: 'DAY_CARE', startTime: '09:00', endTime: '16:00' },
  { id: 'rs2', residentId: 'r2', date: dateStr, title: '生活介護（B事業所）', type: 'DAY_CARE', startTime: '09:30', endTime: '15:30' },
  { id: 'rs3', residentId: 'r3', date: dateStr, title: '就労B型', type: 'DAY_CARE', startTime: '10:00', endTime: '15:00' },
  { id: 'rs4', residentId: 'r4', date: dateStr, title: '就労移行支援', type: 'DAY_CARE', startTime: '09:00', endTime: '17:00' },
  // Example of other types
  { id: 'rs5', residentId: 'r1', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], title: '定期通院（内科）', type: 'VISIT', startTime: '10:00', notes: '付き添い必要' },
  { id: 'rs6', residentId: 'r2', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], title: '実家帰省', type: 'HOME' },
];

export const INITIAL_STOCK: StockItem[] = [
  { id: 'st1', name: 'トイレットペーパー', category: 'daily', quantity: 12, unit: 'ロール', threshold: 6, ownerType: 'COMPANY', isOrderRequested: false },
  { id: 'st2', name: 'ハンドソープ詰め替え', category: 'daily', quantity: 2, unit: '個', threshold: 3, ownerType: 'COMPANY', isOrderRequested: true },
  { id: 'st3', name: '絆創膏', category: 'medical', quantity: 50, unit: '枚', threshold: 20, ownerType: 'COMPANY', isOrderRequested: false },
  { id: 'st4', name: 'とろみ剤 (業務用)', category: 'food', quantity: 3, unit: '袋', threshold: 2, ownerType: 'COMPANY', isOrderRequested: false },
  // Resident Specific Stock
  { id: 'rst1', name: 'リハビリパンツ (L)', category: 'daily', quantity: 20, unit: '枚', threshold: 10, ownerType: 'RESIDENT', residentId: 'r1', isOrderRequested: false },
  { id: 'rst2', name: '尿取りパッド', category: 'daily', quantity: 40, unit: '枚', threshold: 15, ownerType: 'RESIDENT', residentId: 'r1', isOrderRequested: false },
  { id: 'rst3', name: 'とろみ剤 (個別)', category: 'food', quantity: 2, unit: '本', threshold: 3, ownerType: 'RESIDENT', residentId: 'r1', isOrderRequested: true },
];

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: 'ec1', name: 'かかりつけ医 (◯◯クリニック)', relationship: '主治医', phoneNumber: '03-1234-5678', isMedical: true },
  { id: 'ec2', name: '訪問看護ステーション', relationship: '看護連携', phoneNumber: '03-8765-4321', isMedical: true },
  { id: 'ec3', name: '管理者 佐々木', relationship: '管理者', phoneNumber: '090-0000-0000' },
  { id: 'ec4', name: 'ALSOK警備', relationship: '警備会社', phoneNumber: '0120-000-000' },
];

// Map Data
export const INITIAL_ROOMS: Room[] = [
  // TOP ROW
  { 
    id: 'room1', name: '101 (個室)', type: 'PRIVATE', residentId: 'r1',
    furniture: [{id: 'f1', name: '電動ベッド'}, {id: 'f2', name: '整理ダンス'}],
    x: 0, y: 0, width: 25, height: 40
  },
  { 
    id: 'room2', name: '102 (個室)', type: 'PRIVATE', residentId: 'r2',
    furniture: [{id: 'f3', name: 'ベッド'}, {id: 'f4', name: 'テレビ台'}],
    x: 25, y: 0, width: 25, height: 40
  },
  { 
    id: 'toilet', name: 'トイレ', type: 'TOILET',
    furniture: [{id: 't1', name: '手すり'}],
    x: 50, y: 0, width: 15, height: 20
  },
  { 
    id: 'storage', name: '物置', type: 'STORAGE',
    furniture: [{id: 'st1', name: '掃除機'}, {id: 'st2', name: 'ストック棚'}],
    x: 50, y: 20, width: 15, height: 20
  },
  {
    id: 'bath', name: '浴室', type: 'BATH',
    furniture: [{id: 'b1', name: 'シャワーチェア'}],
    x: 65, y: 0, width: 35, height: 40
  },

  // MIDDLE
  {
    id: 'hallway', name: '廊下', type: 'CORRIDOR',
    furniture: [],
    x: 0, y: 40, width: 100, height: 20
  },

  // BOTTOM ROW
  { 
    id: 'room3', name: '103 (個室)', type: 'PRIVATE', residentId: 'r3',
    furniture: [{id: 'f5', name: 'ベッド'}, {id: 'f6', name: '本棚'}],
    x: 0, y: 60, width: 25, height: 40
  },
  { 
    id: 'room4', name: '104 (個室)', type: 'PRIVATE', residentId: 'r4',
    furniture: [{id: 'f7', name: 'ベッド'}, {id: 'f8', name: 'PCデスク'}],
    x: 25, y: 60, width: 25, height: 40
  },
  { 
    id: 'office', name: '事務所', type: 'OFFICE', 
    furniture: [{id: 'o1', name: 'PC'}, {id: 'o2', name: '鍵保管庫'}, {id: 'o3', name: '書類棚'}],
    x: 50, y: 60, width: 20, height: 20
  },
  { 
    id: 'dining', name: '食堂', type: 'SHARED', 
    furniture: [{id: 'd1', name: 'ダイニングテーブル'}, {id: 'd2', name: 'テレビ'}, {id: 'd3', name: '椅子x4'}],
    x: 70, y: 60, width: 30, height: 40
  },
  {
    id: 'entrance', name: '玄関', type: 'ENTRANCE',
    furniture: [{id: 'e1', name: '洗面台'}, {id: 'e2', name: '下駄箱'}],
    x: 50, y: 80, width: 20, height: 20
  }
];

export const INITIAL_REPORTS: IncidentReport[] = [
  {
    id: 'rep1',
    type: 'HIYARI',
    createdAt: '2023-10-10T10:00:00',
    authorId: 's2',
    authorName: '山田 (スタッフ)',
    readByStaffIds: ['s1', 's2'], // Manager and author have read it
    when: '2023-10-10 09:30',
    where: '食堂',
    who: '田中 健一 様',
    what: 'お茶を飲もうとした際に、コップの手が滑りこぼしそうになった。',
    why: 'コップの持ち手が小さく、麻痺のある手では掴みにくかったため。',
    how: '持ち手の大きい介護用コップに変更し、滑り止めマットを敷いた。',
  }
];
