const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config/config');
// 引入MySQL连接（移除MongoDB连接）
require('./config/database'); 

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 路由
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const downloadRoutes = require('./routes/download');
app.use('/api', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api', downloadRoutes);
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// 静态文件服务（图片上传目录）
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 1, message: '服务器内部错误' });
});

// 启动服务器
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

// 在 app.listen 之后添加
process.on('SIGINT', () => {
  server.close(() => {
    console.log('进程已终止');
    process.exit(0);
  });
});

module.exports = app;