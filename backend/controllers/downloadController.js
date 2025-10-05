const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const crypto = require('crypto'); // 新增：用于生成签名
const config = require('../config/config');

// 获取日期文件夹列表（保持不变）
exports.getFolderList = (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../uploads');
    console.log('尝试读取的上传目录:', uploadDir);
    
    if (!fs.existsSync(uploadDir)) {
      console.error('上传目录不存在:', uploadDir);
      return res.json({
        code: 1, 
        message: '上传目录不存在', 
        debug: { uploadDir }
      });
    }
    
    const dirents = fs.readdirSync(uploadDir, { withFileTypes: true });
    console.log('目录内容:', dirents.map(d => d.name));
    
    const folders = dirents
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .sort((a, b) => new Date(b) - new Date(a));
      
    console.log('筛选后的日期文件夹:', folders);
    
    res.json({
      code: 0,
      data: { folders },
      debug: { 
        uploadDir,
        totalFolders: folders.length
      }
    });
  } catch (error) {
    console.error('获取文件夹列表错误:', error);
    res.status(500).json({ 
      code: 1, 
      message: '获取文件夹列表失败',
      debug: {
        error: error.message,
        stack: error.stack.substring(0, 200)
      }
    });
  }
};

// 新增：生成下载链接接口
exports.generateDownloadLink = (req, res) => {
  try {
    const { date, password } = req.body;
    
    // 密码验证
    if (password !== config.downloadPassword) {
      return res.status(403).json({ code: 1, message: '密码错误' });
    }

    const uploadDir = path.join(__dirname, '../uploads');
    const targetDir = path.join(uploadDir, date);
    
    // 检查目录是否存在
    if (!fs.existsSync(targetDir)) {
      return res.status(404).json({ code: 1, message: '文件夹不存在' });
    }

    // 生成带签名的临时下载链接（有效期1小时）
    const expireTime = Date.now() + 3600000; // 1小时有效期
    const signature = crypto
      .createHmac('sha256', config.secretKey || 'your-default-secret-key')
      .update(`${date}_${expireTime}`)
      .digest('hex');
      
    // 生成下载链接
    const downloadLink = `${config.server.baseUrl || 'https://xinxijiaozanzhu.site'}/api/download?date=${date}&signature=${signature}&expires=${expireTime}`;
    
    res.json({
      code: 0,
      data: {
        downloadLink,
        expireTime: new Date(expireTime).toLocaleString()
      }
    });
  } catch (error) {
    console.error('生成下载链接失败:', error);
    res.status(500).json({ code: 1, message: '生成下载链接失败: ' + error.message });
  }
};

// 修改：处理通过链接的下载请求
exports.downloadViaLink = (req, res) => {
  try {
    const { date, signature, expires } = req.query;
    
    // 验证链接是否过期
    if (Date.now() > expires) {
      return res.status(403).json({ code: 1, message: '下载链接已过期' });
    }
    
    // 验证签名
    const validSignature = crypto
      .createHmac('sha256', config.secretKey || 'your-default-secret-key')
      .update(`${date}_${expires}`)
      .digest('hex');
      
    if (signature !== validSignature) {
      return res.status(403).json({ code: 1, message: '下载链接无效' });
    }

    const uploadDir = path.join(__dirname, '../uploads');
    const targetDir = path.join(uploadDir, date);
    
    if (!fs.existsSync(targetDir)) {
      return res.status(404).json({ code: 1, message: '文件夹不存在' });
    }

    // 使用archiver压缩并通过响应流发送
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${date}.zip"`);
    
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    // 压缩目标文件夹
    archive.directory(targetDir, false);
    
    // 处理错误
    archive.on('error', (err) => {
      console.error('压缩失败:', err);
      if (!res.headersSent) {
        res.status(500).json({ code: 1, message: '压缩文件夹失败' });
      }
    });
    
    // 将压缩流导入响应
    archive.pipe(res);
    
    // 完成压缩
    archive.finalize();
  } catch (error) {
    console.error('下载失败:', error);
    res.status(500).json({ code: 1, message: '下载失败: ' + error.message });
  }
};