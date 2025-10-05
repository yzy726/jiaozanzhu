// 身份验证中间件
const jwt = require('../utils/jwt');
const User = require('../models/User'); // 引入User模型

module.exports = async (req, res, next) => { // 改为async函数
  try {
    // 获取Authorization头
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 1, message: '未授权访问' });
    }
    
    // 提取token
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token);
    
    if (!payload || !payload.openid) {
      return res.status(401).json({ code: 1, message: 'token无效或已过期' });
    }
    
    // 从数据库查询完整用户信息
    const user = await User.findOne({
      where: { openid: payload.openid },
      attributes: ['name', 'studentId', 'openid'] // 只选择需要的字段
    });
    
    // 将完整用户信息添加到请求对象
    req.user = user || {};
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    res.status(500).json({ code: 1, message: '服务器认证失败' });
  }
};