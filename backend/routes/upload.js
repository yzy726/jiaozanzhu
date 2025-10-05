// 创建routes/upload.js文件
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../config/upload');
const auth = require('../middleware/auth'); // 身份验证中间件

// 图片上传接口（需要登录）
router.post('/upload', auth, upload, uploadController.uploadImage);

// 获取图片列表接口
router.get('/images', auth, uploadController.getImages);

module.exports = router;