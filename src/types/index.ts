export interface EndoscopyImage {
  id: string;
  url: string;
  name: string;
  tag?: string;
  size?: number;
  createdAt: number;
}

export type ExamType = '电子胃镜' | '电子大肠镜' | '电子无痛胃镜' | '电子支气管镜' | '胶囊内镜' | '小肠镜';

export interface PatientRecord {
  id: string;
  patientName?: string;
  gender?: '男' | '女';
  age?: number;
  idCard: string; // 18位身份证号 (患者端唯一调阅凭证)
  phone?: string;  // 可选手机号
  examType: ExamType;
  examDate: string; // YYYY-MM-DD
  doctorName: string;
  department: string;
  findings: string;     // 镜检所见
  diagnosis: string;    // 内镜诊断
  recommendations?: string; // 建议与处理
  images: EndoscopyImage[];
  createdAt: number;
  updatedAt: number;
}

export const EXAM_TYPE_OPTIONS: ExamType[] = [
  '电子胃镜',
  '电子大肠镜',
  '电子无痛胃镜',
  '电子支气管镜',
  '胶囊内镜',
  '小肠镜'
];

export const LOCATION_TAG_OPTIONS = [
  '胃窦',
  '胃体小弯',
  '胃体大弯',
  '胃角',
  '贲门',
  '十二指肠球部',
  '十二指肠降部',
  '升结肠',
  '横结肠',
  '降结肠',
  '乙状结肠',
  '直肠'
];

export const COMMON_DIAGNOSES = [
  '慢性浅表性胃炎',
  '慢性萎缩性胃炎伴糜烂',
  '十二指肠球部溃疡 (A1期)',
  '胃息肉 (已切除)',
  '结肠多发息肉',
  '反流性食管炎 (LA-A级)',
  '未见明显异常'
];
