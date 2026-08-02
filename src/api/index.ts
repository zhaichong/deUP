import type { PatientRecord } from '../types';
import { getRecords, saveRecord as saveToLocalStorage, deleteRecord as deleteFromLocalStorage, findPatientRecord, resetToDemoData } from '../utils/storage';

export interface DoctorSession {
  id: string;
  username: string;
  name: string;
  title: string;
  department: string;
  role: 'admin' | 'doctor';
}

const DOCTOR_SESSION_KEY = 'deup_current_doctor_session';
const API_BASE = '';

/**
 * 医生/管理员登录 API
 */
export async function loginDoctor(username: string, password: string): Promise<DoctorSession> {
  const res = await fetch(`${API_BASE}/api/doctors/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`后端接口响应异常 (${res.status})，请确保后端服务正常运行`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '登录失败');
  }

  localStorage.setItem(DOCTOR_SESSION_KEY, JSON.stringify(data));
  return data;
}

/**
 * 管理员创建/增加新医生账户 API
 */
export async function registerDoctor(params: {
  username: string;
  password: string;
  name: string;
  title?: string;
  department?: string;
  role?: 'admin' | 'doctor';
}): Promise<DoctorSession> {
  const res = await fetch(`${API_BASE}/api/doctors/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`后端接口响应异常 (${res.status})，请确保后端服务正常运行`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '创建医生账号失败');
  }

  return data;
}

/**
 * 管理员编辑/更新医生账户 API
 */
export async function updateDoctor(id: string, params: {
  name?: string;
  title?: string;
  department?: string;
  password?: string;
}): Promise<DoctorSession> {
  const res = await fetch(`${API_BASE}/api/doctors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`后端接口响应异常 (${res.status})`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '修改医生账号失败');
  }

  return data;
}

/**
 * 管理员拉取全部医生账号列表
 */
export async function fetchDoctorsList(): Promise<DoctorSession[]> {
  try {
    const res = await fetch(`${API_BASE}/api/doctors`);
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      return await res.json();
    }
  } catch (e) {
    console.error('获取医生账号列表失败', e);
  }
  return [];
}

/**
 * 管理员删除/注销医生账号
 */
export async function deleteDoctor(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/doctors/${id}`, {
    method: 'DELETE'
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`后端接口响应异常 (${res.status})`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '删除医生账号失败');
  }

  return true;
}

/**
 * 获取当前登录的 Session
 */
export function getCurrentDoctor(): DoctorSession | null {
  try {
    const raw = localStorage.getItem(DOCTOR_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * 退出医生登录
 */
export function logoutDoctor(): void {
  localStorage.removeItem(DOCTOR_SESSION_KEY);
}

/**
 * 获取所有报告记录
 */
export async function fetchAllRecords(): Promise<PatientRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/api/records`);
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      return await res.json();
    }
  } catch (e) {
    console.warn('后端服务不可用，降级使用本地存储:', e);
  }
  return getRecords();
}

/**
 * 患者凭身份证号精准查询
 */
export async function queryRecordsByIdCard(idCard: string): Promise<PatientRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/api/records/search?idCard=${encodeURIComponent(idCard)}`);
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      return await res.json();
    }
  } catch (e) {
    console.warn('后端服务不可用，降级使用本地查询:', e);
  }
  return findPatientRecord(idCard);
}

/**
 * 保存或发布一份新检查记录
 */
export async function saveRecord(record: PatientRecord): Promise<PatientRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/api/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      saveToLocalStorage(record);
      return await fetchAllRecords();
    }
  } catch (e) {
    console.warn('后端服务不可用，降级保存至本地:', e);
  }
  return saveToLocalStorage(record);
}

/**
 * 删除一条报告记录
 */
export async function deleteRecord(id: string): Promise<PatientRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/api/records/${id}`, {
      method: 'DELETE'
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      deleteFromLocalStorage(id);
      return await fetchAllRecords();
    }
  } catch (e) {
    console.warn('后端服务不可用，降级从本地删除:', e);
  }
  return deleteFromLocalStorage(id);
}

/**
 * 重置示例文案与数据库
 */
export async function resetDemo(): Promise<PatientRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/api/reset-demo`, {
      method: 'POST'
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      resetToDemoData();
      return await res.json();
    }
  } catch (e) {
    console.warn('降级使用本地示范重置');
  }
  return resetToDemoData();
}
