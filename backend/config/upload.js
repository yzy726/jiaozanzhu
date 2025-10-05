// 创建config/upload.js文件

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 获取当前日期文件夹名称 YYYY-MM-DD
const getDateDir = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 生成格式化时间字符串 YYYYMMDDHHMMSS
const getFormattedTime = () => {
  const date = new Date();
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`;
};

// 配置存储引擎
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dateDir = getDateDir();
    const destPath = path.join(uploadDir, dateDir);
    fs.mkdirSync(destPath, { recursive: true });
    cb(null, destPath);
  },// 上传文件保存路径
  filename: function (req, file, cb) {
    try {
      // 安全获取用户信息，添加默认值
      const user = req.user || {};
      const { name = 'unknown', studentId = 'guest' } = user;
      
      // 确保变量存在后再调用replace
      const formattedName = (name || 'unknown').replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
      const formattedStudentId = (studentId || 'guest').replace(/[^a-zA-Z0-9]/g, '_');
      
      // 使用时间戳生成文件名（保持用户代码中的格式）
      const formattedTime = getFormattedTime();
      const ext = path.extname(file.originalname);
      const filename = `${formattedTime}_${formattedName}_${formattedStudentId}${ext}`;
      
      cb(null, filename);
    } catch (error) {
      const formattedTime = getFormattedTime();
      const ext = path.extname(file.originalname);
      const safeFilename = `${formattedTime}_error_guest${ext}`;
      console.error('文件上传命名错误:', error);
      cb(null, safeFilename);
    }
  }
});

// 文件过滤（只允许图片）
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'), false);
  }
};

module.exports = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },// 限制5MB
  fileFilter: fileFilter
}).single('image');// 对应前端name=\"image\"的字段