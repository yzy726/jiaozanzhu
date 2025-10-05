// 验证用户是否为管理员
module.exports = (req, res, next) => {
  // 假设用户表中有isAdmin字段标识管理员身份
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ code: 1, message: '权限不足：需要管理员权限' });
  }
};