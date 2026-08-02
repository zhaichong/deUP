/**
 * 校验身份证号码（基础位数与格式校验，友好兼容测试与真实18位号码）
 */
export function validateIdCard(idCard: string): { valid: boolean; message?: string } {
  if (!idCard) {
    return { valid: false, message: '请输入身份证号码' };
  }
  
  const cleanId = idCard.trim().toUpperCase();
  
  if (cleanId.length < 6) {
    return { valid: false, message: '身份证号码至少需要 6 位字符' };
  }

  const reg = /^[0-9a-zA-Z]{6,18}$/;
  if (!reg.test(cleanId)) {
    return { valid: false, message: '身份证号码请输入有效数字或字母' };
  }

  return { valid: true };
}

/**
 * 校验中国大陆11位手机号码
 */
export function validatePhone(phone: string): { valid: boolean; message?: string } {
  if (!phone) {
    return { valid: false, message: '请输入手机号码' };
  }
  
  const cleanPhone = phone.trim();
  const reg = /^1[3-9]\d{9}$/;
  
  if (!reg.test(cleanPhone)) {
    return { valid: false, message: '手机号码格式不正确（需为11位有效手机号）' };
  }

  return { valid: true };
}

/**
 * 敏感信息脱敏显示
 */
export function maskIdCard(idCard: string): string {
  if (!idCard) return '';
  if (idCard.length < 10) return idCard;
  if (idCard.length === 18) {
    return idCard.replace(/^(\d{6})\d{8}(\d{3}[\dXx])$/, '$1********$2');
  }
  return idCard.substring(0, 4) + '****' + idCard.substring(idCard.length - 4);
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 11) return phone || '';
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
}
