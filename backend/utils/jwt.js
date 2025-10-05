// JWT工具函数
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// 生成token
exports.sign = (payload) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

// 验证token
exports.verify = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};