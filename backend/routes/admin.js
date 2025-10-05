const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const config = require('../config/config');

/**
 * 固定密码验证中间件
 * 简单密码验证，适用于本地或信任环境
 */
const passwordAuth = (req, res, next) => {
  // 从请求头或请求体获取密码
  const inputPassword = req.headers['x-query-password'] || req.body.password;
  
  // 与环境变量中的固定密码比对
  if (inputPassword === config.queryPassword) {
    next();
  } else {
    res.status(401).json({ code: 1, message: '查询密码错误' });
  }
};

// 获取所有用户校验码信息（使用固定密码认证）
router.get('/all-users', passwordAuth, adminController.getAllUsers);

module.exports = router;