const User = require('../models/User');

// 获取所有用户信息（包含校验码）
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id', 
        'name', 
        'studentId', 
        'verificationCode', 
        'updatedAt' // 最后更新时间
      ],
      order: [['updatedAt', 'DESC']] // 按更新时间倒序
    });

    res.json({
      code: 0,
      data: {
        users: users.map(user => ({
          ...user.dataValues,
          updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null
        }))
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ code: 1, message: '服务器错误，获取用户列表失败' });
  }
};