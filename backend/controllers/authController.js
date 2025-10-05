const config = require('../config/config');
const jwt = require('../utils/jwt');
const User = require('../models/User');
const request = require('request-promise');

// 生成6位随机数字校验码
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 微信登录接口
exports.login = async (req, res) => {
  try {
    const { code, userInfo, studentId, name } = req.body;
    
    // 1. 获取微信openid
    const wxRes = await request({
      method: 'GET',
      url: `https://api.weixin.qq.com/sns/jscode2session?appid=${config.wechat.appId}&secret=${config.wechat.appSecret}&js_code=${code}&grant_type=authorization_code`,
      json: true
    });

    if (wxRes.errcode) {
      return res.status(400).json({ code: 1, message: '微信登录失败' });
    }

    const { openid, session_key } = wxRes;
    
    // 2. 检查用户是否存在
    let user = await User.findOne({ where: { openid } });
    const isNewUser = !user;
    const isInfoUpdated = user && (user.studentId !== studentId || user.name !== name);
    
    // 3. 生成校验码（新用户或信息更新时）
    let verificationCode = null;
    // 移除所有过期时间设置，校验码永久有效
    let verificationCodeExpires = null;
    
    if (isNewUser || isInfoUpdated) {
      verificationCode = generateVerificationCode();
    }
    
    // 4. 创建或更新用户
    if (isNewUser) {
      user = await User.create({
        openid,
        studentId,
        name,
        userInfo,
        verificationCode,
        verificationCodeExpires, // 始终为null（无过期时间）
        createdAt: new Date()
      });
    } else if (isInfoUpdated) {
      await user.update({
        userInfo,
        studentId,
        name,
        verificationCode,
        verificationCodeExpires, // 始终为null（无过期时间）
        updatedAt: new Date()
      });
    }

    // 5. 生成JWT token
    const token = jwt.sign({ openid });

    // 6. 返回结果
    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        sessionKey: session_key,
        userInfo: user.userInfo,
        isNewUser,
        verificationCode: isNewUser ? verificationCode : null // 新用户返回校验码
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ code: 1, message: '服务器内部错误' });
  }
};

// 校验码验证接口（仅验证值匹配，无过期检查）
exports.verifyCode = async (req, res) => {
  try {
    const { verificationCode } = req.body;
    const { openid } = req.user; // 从JWT获取openid

    // 查找用户
    const user = await User.findOne({ where: { openid } });
    
    if (!user) {
      return res.status(404).json({ code: 1, message: '用户不存在' });
    }

    // 仅验证校验码值是否匹配（无过期检查）
    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ code: 1, message: '校验码错误' });
    }

    res.json({ code: 0, message: '校验码验证成功' });
  } catch (error) {
    console.error('校验码验证错误:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

// 获取当前用户校验码接口
exports.getVerificationCode = async (req, res) => {
  try {
    const { openid } = req.user;
    const user = await User.findOne({ where: { openid } });

    if (!user || !user.verificationCode) {
      return res.status(404).json({ code: 1, message: '校验码不存在' });
    }

    res.json({
      code: 0,
      data: {
        verificationCode: user.verificationCode,
        expiresAt: null // 明确返回null表示无过期时间
      }
    });
  } catch (error) {
    console.error('获取校验码错误:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};

// 更新用户信息并生成新校验码（永久有效）
exports.updateUserInfo = async (req, res) => {
  try {
    const { studentId, name } = req.body;
    const { openid } = req.user;

    const user = await User.findOne({ where: { openid } });
    
    if (!user) {
      return res.status(404).json({ code: 1, message: '用户不存在' });
    }

    // 生成新的校验码（无过期时间）
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = null; // 永久有效

    // 更新用户信息和校验码
    await user.update({
      studentId,
      name,
      verificationCode,
      verificationCodeExpires,
      updatedAt: new Date()
    });

    res.json({ code: 0, message: '用户信息更新成功' });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ code: 1, message: '服务器错误' });
  }
};