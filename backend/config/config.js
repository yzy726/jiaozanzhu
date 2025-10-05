// 系统配置文件
module.exports = {
  // 服务器配置
  server: {
    port: 3000, // 需要用户填写：服务器端口号
    baseUrl: 'https://xinxijiaozanzhu.site' // 添加服务器基础URL
  },
  
  // 数据库配置
  database: {
    host: 'localhost',      // 需要用户填写：MySQL主机
    port: 3306,             // 需要用户填写：MySQL端口（默认3306）
    user: 'root',           // 需要用户填写：MySQL用户名
    password: 'hbyzy2006',           // 需要用户填写：MySQL密码
    database: 'miniprogram', // 需要用户填写：数据库名
    dialect: 'mysql',       // 数据库类型
    pool: {
      max: 5,               // 连接池最大连接数
      min: 0,               // 最小连接数
      acquire: 30000,       // 连接超时时间（ms）
      idle: 10000           // 空闲连接超时时间（ms）
    }
  },
  
  // JWT配置
  jwt: {
    secret: '23589bcd96903c9e94853d4d1367d02710132c529a56f3c9bf97e26c69955da9', // 需要用户填写：JWT密钥
    expiresIn: '7d', // Token有效期
  },
  
  // 微信小程序配置
  wechat: {
    appId: 'wx34f04098cd345544', // 需要用户填写：小程序AppID
    appSecret: 'b63b427056047391074daceaa7812feb', // 需要用户填写：小程序AppSecret
  },

  downloadPassword: 'hbyzy2006', // 添加下载密码
  secretKey: '938a5cfdaf4b2c3d26e150d552d80da6cb1bbc61cf0bfeb590c35a087d85a63d', // 添加签名密钥

  queryPassword: 'hbyzy2006', // 可复用downloadPassword或设置新密码
};
