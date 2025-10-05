const { Sequelize } = require('sequelize');
const config = require('./config');

// 创建Sequelize实例
const sequelize = new Sequelize(
  config.database.database,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    pool: config.database.pool
  }
);

// 测试数据库连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('MySQL数据库连接成功');
  } catch (error) {
    console.error('MySQL数据库连接失败:', error);
    process.exit(1); // 连接失败时退出应用
  }
}

// 执行连接测试
testConnection();

module.exports = sequelize;