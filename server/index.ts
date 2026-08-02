import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getAllRecordsFromDB,
  searchRecordsByIdCardFromDB,
  saveRecordToDB,
  deleteRecordFromDB,
  resetDemoDB,
  registerDoctorDB,
  loginDoctorDB,
  getAllDoctorsDB
} from './db';

const app = express();
const PORT = process.env.PORT || 3001;

// 确保 uploads 文件夹存在
const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态托管上传的图片
app.use('/uploads', express.static(uploadsDir));

// Multer 文件上传配置
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = `endo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// API 路由: 医生/管理员账户登录
app.post('/api/doctors/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '请输入用户名和密码' });
  }

  try {
    const doctor = loginDoctorDB(username, password);
    res.json(doctor);
  } catch (err: any) {
    res.status(400).json({ error: err.message || '登录失败' });
  }
});

// API 路由: 管理员增加/注册新医生用户
app.post('/api/doctors/register', (req, res) => {
  const { username, password, name, title, department, role } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ error: '用户名、密码与医生姓名均为必填项' });
  }

  try {
    const doctor = registerDoctorDB({ username, password, name, title, department, role });
    res.json(doctor);
  } catch (err: any) {
    res.status(400).json({ error: err.message || '创建医生账号失败' });
  }
});

// API 路由: 获取所有医生用户列表（管理员页面）
app.get('/api/doctors', (_req, res) => {
  try {
    const doctors = getAllDoctorsDB();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: '获取医生列表失败' });
  }
});

// API 路由: 上传图片文件接口
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请上传有效图片' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: imageUrl,
    filename: req.file.filename,
    size: req.file.size
  });
});

// API 路由: 获取所有检查记录（医生端）
app.get('/api/records', (_req, res) => {
  try {
    const records = getAllRecordsFromDB();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: '获取记录列表失败' });
  }
});

// API 路由: 按身份证号精确查询记录（患者端）
app.get('/api/records/search', (req, res) => {
  const idCard = (req.query.idCard as string) || '';
  if (!idCard) {
    return res.status(400).json({ error: '缺少身份证号参数' });
  }

  try {
    const records = searchRecordsByIdCardFromDB(idCard);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: '查询记录失败' });
  }
});

// API 路由: 保存/新建检查记录
app.post('/api/records', (req, res) => {
  const record = req.body;
  if (!record || !record.idCard) {
    return res.status(400).json({ error: '身份证号不能为空' });
  }

  try {
    const saved = saveRecordToDB(record);
    res.json(saved);
  } catch (err) {
    console.error('保存记录失败:', err);
    res.status(500).json({ error: '保存记录到数据库失败' });
  }
});

// API 路由: 删除记录
app.delete('/api/records/:id', (req, res) => {
  const { id } = req.params;
  try {
    const success = deleteRecordFromDB(id);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: '删除记录失败' });
  }
});

// API 路由: 重置演示数据库
app.post('/api/reset-demo', (_req, res) => {
  try {
    const records = resetDemoDB();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: '重置示范数据库失败' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`[Endoscopy Backend Server] 医生上传与患者调阅后端服务已启动: http://localhost:${PORT}`);
});
