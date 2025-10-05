const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 定义User模型（对应MySQL表）
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  openid: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '微信openid'
  },
  studentId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '学号'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '姓名'
  },
  userInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '用户信息（昵称、头像等）'
  },
  verificationCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: '校验码'
  },
  verificationCodeExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '校验码过期时间'
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否为管理员'
  },
  uploadedImages: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: '上传图片列表'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '更新时间'
  }
}, {
  tableName: 'users', // 表名
  timestamps: true,   // 自动添加createdAt和updatedAt字段
  charset: 'utf8mb4', // 字符集
  collate: 'utf8mb4_general_ci'
});

// 同步模型到数据库（创建表）
User.sync({ alter: true })
  .then(() => console.log('User表同步成功'))
  .catch(err => console.error('User表同步失败:', err));

module.exports = User;