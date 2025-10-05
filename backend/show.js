const { Op } = require('sequelize');
const sequelize = require('./config/database');
const User = require('./models/User');

// 显示所有用户的最新校验码信息
async function displayAllVerificationCodes() {
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功，正在查询所有用户校验码...\n');

    // 查询所有有校验码的用户
    const users = await User.findAll({
      attributes: [
        'openid', 
        'name', 
        'studentId', 
        'verificationCode', 
        'verificationCodeExpires'
      ],
      where: {
        verificationCode: { [Op.not]: null }, // 只查询有校验码的用户
        verificationCodeExpires: { [Op.gt]: new Date() } // 可选：只显示未过期的
      },
      order: [['updatedAt', 'DESC']] // 按更新时间倒序排列
    });

    if (users.length === 0) {
      console.log('没有找到任何用户的校验码信息');
      return;
    }

    // 格式化输出
    console.log('==================== 用户校验码列表 ====================\n');
    users.forEach((user, index) => {
      console.log(`用户 ${index + 1}:`);
      console.log(`  OpenID: ${user.openid}`);
      console.log(`  姓名: ${user.name || '未设置'}`);
      console.log(`  学号: ${user.studentId || '未设置'}`);
      console.log(`  校验码: ${user.verificationCode}`);
      console.log(`  有效期至: ${new Date(user.verificationCodeExpires).toLocaleString()}`);
      console.log('------------------------------------------------------');
    });

  } catch (error) {
    console.error('查询过程中发生错误:', error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
    console.log('\n数据库连接已关闭');
  }
}

// 执行查询
displayAllVerificationCodes();