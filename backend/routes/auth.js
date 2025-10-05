// 认证相关路由
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth'); // JWT验证中间件

// 登录接口
router.post('/login', authController.login);

// 验证校验码接口
router.post('/verify-code', authMiddleware, authController.verifyCode);

// 获取校验码接口
router.get('/get-verification-code', authMiddleware, authController.getVerificationCode);

// 更新用户信息并生成校验码接口
router.post('/update-user-info', authMiddleware, authController.updateUserInfo);

module.exports = router;