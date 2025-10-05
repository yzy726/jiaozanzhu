const fs = require('fs');
const path = require('path');
const User = require('../models/User');

// 获取当前日期文件夹名称
const getDateDir = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 1, message: '未找到上传文件' });
    }

    const openid = req.user.openid;
    const user = await User.findOne({ where: { openid } });

    if (!user) {
      return res.status(404).json({ code: 1, message: '用户不存在' });
    }

    const dateDir = getDateDir();
    const imageUrl = `/uploads/${dateDir}/${req.file.filename}`;
    const uploadedImages = user.uploadedImages || [];
    
    uploadedImages.push({
      url: imageUrl,
      uploadTime: new Date(),
      fileName: req.file.filename
    });

    await user.update({ uploadedImages });

    res.json({
      code: 0,
      message: '图片上传成功',
      data: {
        imageUrl: imageUrl,
        fileName: req.file.filename
      }
    });
  } catch (error) {
    console.error('图片上传错误:', error);
    res.status(500).json({ code: 1, message: '图片上传失败: ' + error.message });
  }
};

exports.getImages = async (req, res) => {
  try {
    const openid = req.user.openid;
    const user = await User.findOne({ 
      where: { openid },
      attributes: ['uploadedImages']
    });
    
    res.json({
      code: 0,
      data: {
        images: user ? user.uploadedImages || [] : []
      }
    });
  } catch (error) {
    res.status(500).json({ code: 1, message: '获取图片列表失败' });
  }
};