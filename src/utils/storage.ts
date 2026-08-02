import type { PatientRecord } from '../types';

const STORAGE_KEY = 'deup_endoscopy_records_v2';

// 动态生成高清质感内镜模拟图像 Base64
function generateMockEndoscopySVG(title: string, color: string, detail: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <radialGradient id="grad" cx="50%" cy="50%" r="50%" fx="40%" fy="40%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.95"/>
        <stop offset="70%" stop-color="#991b1b" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#450a0a" stop-opacity="0.98"/>
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect width="600" height="600" fill="#0f172a"/>
    <circle cx="300" cy="300" r="270" fill="url(#grad)"/>
    <!-- 血管网与粘膜皱襞纹理 -->
    <path d="M120 280 Q 220 200 300 300 T 480 320" stroke="#fca5a5" stroke-width="4" fill="none" opacity="0.6"/>
    <path d="M180 360 Q 280 440 380 320 T 450 180" stroke="#f87171" stroke-width="5" fill="none" opacity="0.5"/>
    <path d="M220 180 Q 320 220 400 150" stroke="#ef4444" stroke-width="3" fill="none" opacity="0.7"/>
    <!-- 反光点 (内镜光源镜头反射) -->
    <ellipse cx="230" cy="210" rx="35" ry="20" fill="#ffffff" opacity="0.75" transform="rotate(-20 230 210)"/>
    <circle cx="210" cy="200" r="8" fill="#ffffff" opacity="0.9"/>
    <!-- 病灶标注圈 -->
    <circle cx="340" cy="330" r="45" fill="none" stroke="#facc15" stroke-width="3" stroke-dasharray="6,4" filter="url(#glow)"/>
    <!-- 标注位置与水印 -->
    <rect x="25" y="25" width="220" height="40" rx="8" fill="#000000" opacity="0.65"/>
    <text x="40" y="50" fill="#38bdf8" font-family="sans-serif" font-size="18" font-weight="bold">${title}</text>
    <rect x="25" y="535" width="340" height="40" rx="8" fill="#000000" opacity="0.65"/>
    <text x="40" y="560" fill="#f8fafc" font-family="sans-serif" font-size="16">${detail}</text>
    <text x="470" y="560" fill="#94a3b8" font-family="sans-serif" font-size="14">HD ENDO CAM</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 预设示例文案与记录，供首次使用即刻测试
const INITIAL_RECORDS: PatientRecord[] = [
  {
    id: 'REC-20260802-001',
    patientName: '张建国',
    gender: '男',
    age: 52,
    idCard: '110101197405122334',
    phone: '13812345678',
    examType: '电子胃镜',
    examDate: '2026-08-01',
    doctorName: '李伟 主任医师',
    department: '脾胃病科（消化内镜室）',
    findings: '食管黏膜光滑，管腔通畅，齿状线清晰。胃窦黏膜充血水肿，可见多发红斑及散在浅表糜烂；胃体小弯侧见一约0.8cm×0.6cm息肉样隆起，表面光滑。十二指肠球部及降部未见明显异常。',
    diagnosis: '1. 慢性浅表性胃炎伴糜烂\n2. 胃体息肉（建议内镜下切除）',
    recommendations: '建议病理结果回报后复诊，定期复查胃镜。清淡饮食，避免辛辣刺激。',
    images: [
      {
        id: 'img-101',
        name: '胃窦黏膜',
        tag: '胃窦',
        url: generateMockEndoscopySVG('部位: 胃窦', '#b91c1c', '黏膜充血水肿，散在红斑糜烂'),
        createdAt: Date.now() - 86400000
      },
      {
        id: 'img-102',
        name: '胃体隆起病变',
        tag: '胃体小弯',
        url: generateMockEndoscopySVG('部位: 胃体小弯', '#991b1b', '见0.8cm息肉样隆起，边界清'),
        createdAt: Date.now() - 86400000
      },
      {
        id: 'img-103',
        name: '十二指肠球部',
        tag: '十二指肠球部',
        url: generateMockEndoscopySVG('部位: 十二指肠球部', '#dc2626', '黏膜色泽正常，未见溃疡'),
        createdAt: Date.now() - 86400000
      }
    ],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000
  },
  {
    id: 'REC-20260802-002',
    patientName: '王美玲',
    gender: '女',
    age: 41,
    idCard: '310104198509204562',
    phone: '13988886666',
    examType: '电子大肠镜',
    examDate: '2026-08-02',
    doctorName: '陈敏 副主任医师',
    department: '脾胃病科（消化内镜室）',
    findings: '全结肠到达盲肠，肠洁度良好。回盲瓣开口正常。乙状结肠见一约0.5cm无蒂息肉，表面充血，已行高频电切除术，创面无明显出血。直肠及其余各段结肠黏膜光滑。',
    diagnosis: '1. 乙状结肠息肉（已行电切术）\n2. 结肠黏膜未见明显其它异常',
    recommendations: '息肉标本已送病理检验。术后24小时流质饮食，注意观察便血情况。',
    images: [
      {
        id: 'img-201',
        name: '乙状结肠息肉切除前',
        tag: '乙状结肠',
        url: generateMockEndoscopySVG('部位: 乙状结肠', '#9f1239', '0.5cm无蒂息肉，创面完好'),
        createdAt: Date.now() - 3600000
      },
      {
        id: 'img-202',
        name: '回盲部',
        tag: '升结肠',
        url: generateMockEndoscopySVG('部位: 回盲部', '#be123c', '回盲瓣开口清晰，黏膜正常'),
        createdAt: Date.now() - 3600000
      }
    ],
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000
  }
];

/**
 * 从 LocalStorage 读取所有患者记录
 */
export function getRecords(): PatientRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // 首次加载时保存预设示范数据
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('读取存储记录失败:', e);
    return INITIAL_RECORDS;
  }
}

/**
 * 保存或更新一条患者记录
 */
export function saveRecord(record: PatientRecord): PatientRecord[] {
  const records = getRecords();
  const existingIndex = records.findIndex((r) => r.id === record.id);
  
  if (existingIndex >= 0) {
    records[existingIndex] = { ...record, updatedAt: Date.now() };
  } else {
    records.unshift({ ...record, createdAt: Date.now(), updatedAt: Date.now() });
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('保存记录到 LocalStorage 失败:', e);
  }
  return records;
}

/**
 * 删除一条记录
 */
export function deleteRecord(id: string): PatientRecord[] {
  const records = getRecords().filter((r) => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('删除记录失败:', e);
  }
  return records;
}

/**
 * 患者按身份证号或手机号精确查询
 */
export function findPatientRecord(query: string): PatientRecord[] {
  const cleanQuery = query.trim().toUpperCase();
  if (!cleanQuery) return [];

  const records = getRecords();
  return records.filter((r) => {
    const matchIdCard = r.idCard.toUpperCase() === cleanQuery;
    const matchPhone = r.phone === cleanQuery;
    return matchIdCard || matchPhone;
  });
}

/**
 * 重置回初始演示数据
 */
export function resetToDemoData(): PatientRecord[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RECORDS));
  return INITIAL_RECORDS;
}
