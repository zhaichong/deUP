import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { PatientRecord } from '../src/types';

export interface DoctorUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  title: string;
  department: string;
  role: 'admin' | 'doctor';
  createdAt: number;
}

const dbPath = path.join(process.cwd(), 'server', 'endoscopy.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

// 初始化数据表：包含 role 角色字段 ('admin' | 'doctor')
db.exec(`
  CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    idCard TEXT NOT NULL,
    phone TEXT,
    examType TEXT NOT NULL,
    examDate TEXT NOT NULL,
    doctorName TEXT,
    department TEXT,
    findings TEXT,
    diagnosis TEXT,
    recommendations TEXT,
    images TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_records_idCard ON records(idCard);

  CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    title TEXT,
    department TEXT,
    role TEXT NOT NULL DEFAULT 'doctor',
    createdAt INTEGER NOT NULL
  );
`);

// 动态生成示例文案
function generateMockEndoscopySVG(title: string, color: string, detail: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <radialGradient id="grad" cx="50%" cy="50%" r="50%" fx="40%" fy="40%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.95"/>
        <stop offset="70%" stop-color="#991b1b" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#450a0a" stop-opacity="0.98"/>
      </radialGradient>
    </defs>
    <rect width="600" height="600" fill="#0f172a"/>
    <circle cx="300" cy="300" r="270" fill="url(#grad)"/>
    <path d="M120 280 Q 220 200 300 300 T 480 320" stroke="#fca5a5" stroke-width="4" fill="none" opacity="0.6"/>
    <ellipse cx="230" cy="210" rx="35" ry="20" fill="#ffffff" opacity="0.75" transform="rotate(-20 230 210)"/>
    <circle cx="210" cy="200" r="8" fill="#ffffff" opacity="0.9"/>
    <circle cx="340" cy="330" r="45" fill="none" stroke="#facc15" stroke-width="3" stroke-dasharray="6,4"/>
    <rect x="25" y="25" width="220" height="40" rx="8" fill="#000000" opacity="0.65"/>
    <text x="40" y="50" fill="#38bdf8" font-family="sans-serif" font-size="18" font-weight="bold">${title}</text>
    <rect x="25" y="535" width="340" height="40" rx="8" fill="#000000" opacity="0.65"/>
    <text x="40" y="560" fill="#f8fafc" font-family="sans-serif" font-size="16">${detail}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const INITIAL_RECORDS: PatientRecord[] = [
  {
    id: 'REC-20260802-001',
    patientName: '张建国',
    idCard: '110101197405122334',
    phone: '13812345678',
    examType: '电子胃镜',
    examDate: '2026-08-01',
    doctorName: '李伟 主任医师',
    department: '脾胃病科（消化内镜室）',
    findings: '食管黏膜光滑，管腔通畅。胃窦黏膜充血水肿，可见多发红斑及散在浅表糜烂；胃体小弯侧见一约0.8cm息肉样隆起。',
    diagnosis: '1. 慢性浅表性胃炎伴糜烂\n2. 胃体息肉（建议内镜切除）',
    recommendations: '定期复查胃镜。清淡饮食。',
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
      }
    ],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000
  }
];

// 初始化种子数据
export function seedDatabaseIfEmpty() {
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM records');
  const result = countStmt.get() as { count: number };
  if (result.count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO records (id, idCard, phone, examType, examDate, doctorName, department, findings, diagnosis, recommendations, images, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const r of INITIAL_RECORDS) {
      insertStmt.run(
        r.id,
        r.idCard,
        r.phone || '',
        r.examType,
        r.examDate,
        r.doctorName,
        r.department,
        r.findings,
        r.diagnosis,
        r.recommendations || '',
        JSON.stringify(r.images),
        r.createdAt,
        r.updatedAt
      );
    }
  }

  // 预置管理员账号 (admin / admin) 与示范医生账号 (doctor / 123456)
  const docCount = (db.prepare('SELECT COUNT(*) as count FROM doctors').get() as { count: number }).count;
  if (docCount === 0) {
    const insertDoc = db.prepare(`
      INSERT INTO doctors (id, username, password, name, title, department, role, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. 管理员账户
    insertDoc.run('doc-admin', 'admin', 'admin', '系统管理员', '主任', '内镜中心管理处', 'admin', Date.now());
    // 2. 示范医生账户
    insertDoc.run('doc-001', 'doctor', '123456', '李伟', '主任医师', '脾胃病科（消化内镜室）', 'doctor', Date.now());
  }
}

seedDatabaseIfEmpty();

// 注册创建医生账户 (仅管理员可调用)
export function registerDoctorDB(doc: { username: string; password: string; name: string; title?: string; department?: string; role?: 'admin' | 'doctor' }): DoctorUser {
  const existing = db.prepare('SELECT * FROM doctors WHERE username = ?').get(doc.username.trim());
  if (existing) {
    throw new Error('该用户名已存在，请更换用户名');
  }

  const id = `doc-${Date.now().toString().slice(-6)}`;
  const stmt = db.prepare(`
    INSERT INTO doctors (id, username, password, name, title, department, role, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const role = doc.role || 'doctor';

  stmt.run(
    id,
    doc.username.trim(),
    doc.password,
    doc.name.trim(),
    doc.title?.trim() || '医师',
    doc.department?.trim() || '消化内科',
    role,
    Date.now()
  );

  return {
    id,
    username: doc.username.trim(),
    name: doc.name.trim(),
    title: doc.title?.trim() || '医师',
    department: doc.department?.trim() || '消化内科',
    role,
    createdAt: Date.now()
  };
}

// 修改编辑医生账户资料与密码 (管理员权限)
export function updateDoctorDB(id: string, data: { name?: string; title?: string; department?: string; password?: string }): DoctorUser {
  const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id) as any;
  if (!doctor) {
    throw new Error('未找到要修改的医生账号');
  }

  const newName = data.name !== undefined ? data.name.trim() : doctor.name;
  const newTitle = data.title !== undefined ? data.title.trim() : doctor.title;
  const newDept = data.department !== undefined ? data.department.trim() : doctor.department;
  const newPass = data.password && data.password.trim() ? data.password.trim() : doctor.password;

  db.prepare(`
    UPDATE doctors SET name = ?, title = ?, department = ?, password = ? WHERE id = ?
  `).run(newName, newTitle, newDept, newPass, id);

  return {
    id: doctor.id,
    username: doctor.username,
    name: newName,
    title: newTitle,
    department: newDept,
    role: doctor.role,
    createdAt: doctor.createdAt
  };
}

export function loginDoctorDB(username: string, password: string): DoctorUser {
  const stmt = db.prepare('SELECT * FROM doctors WHERE username = ? AND password = ?');
  const user = stmt.get(username.trim(), password) as any;
  if (!user) {
    throw new Error('用户名或密码错误');
  }
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    title: user.title,
    department: user.department,
    role: user.role || 'doctor',
    createdAt: user.createdAt
  };
}

// 删除医生账户 (管理员权限，不可删除系统内置管理员)
export function deleteDoctorDB(id: string): boolean {
  const doc = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id) as any;
  if (!doc) {
    throw new Error('未找到该医生账号');
  }
  if (doc.role === 'admin' || doc.username === 'admin') {
    throw new Error('系统内置管理员账号受保护，不可删除');
  }

  const res = db.prepare('DELETE FROM doctors WHERE id = ?').run(id);
  return res.changes > 0;
}

// 获取所有已注册医生用户列表（供管理员查阅与修改）
export function getAllDoctorsDB(): DoctorUser[] {
  const stmt = db.prepare('SELECT id, username, name, title, department, role, createdAt FROM doctors ORDER BY createdAt DESC');
  return stmt.all() as DoctorUser[];
}

// 检查记录 SQL 操作
export function getAllRecordsFromDB(): PatientRecord[] {
  const stmt = db.prepare('SELECT * FROM records ORDER BY createdAt DESC');
  const rows = stmt.all() as any[];
  return rows.map((row) => ({
    ...row,
    images: JSON.parse(row.images)
  }));
}

export function searchRecordsByIdCardFromDB(idCard: string): PatientRecord[] {
  const stmt = db.prepare('SELECT * FROM records WHERE UPPER(idCard) = ? ORDER BY createdAt DESC');
  const rows = stmt.all(idCard.trim().toUpperCase()) as any[];
  return rows.map((row) => ({
    ...row,
    images: JSON.parse(row.images)
  }));
}

export function saveRecordToDB(record: PatientRecord): PatientRecord {
  const stmt = db.prepare(`
    INSERT INTO records (id, idCard, phone, examType, examDate, doctorName, department, findings, diagnosis, recommendations, images, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      idCard=excluded.idCard,
      phone=excluded.phone,
      examType=excluded.examType,
      examDate=excluded.examDate,
      doctorName=excluded.doctorName,
      department=excluded.department,
      findings=excluded.findings,
      diagnosis=excluded.diagnosis,
      recommendations=excluded.recommendations,
      images=excluded.images,
      updatedAt=excluded.updatedAt
  `);

  stmt.run(
    record.id,
    record.idCard,
    record.phone || '',
    record.examType,
    record.examDate,
    record.doctorName,
    record.department,
    record.findings,
    record.diagnosis,
    record.recommendations || '',
    JSON.stringify(record.images),
    record.createdAt || Date.now(),
    Date.now()
  );

  return record;
}

export function deleteRecordFromDB(id: string): boolean {
  const stmt = db.prepare('DELETE FROM records WHERE id = ?');
  const res = stmt.run(id);
  return res.changes > 0;
}

export function resetDemoDB(): PatientRecord[] {
  db.exec('DELETE FROM records');
  seedDatabaseIfEmpty();
  return getAllRecordsFromDB();
}
