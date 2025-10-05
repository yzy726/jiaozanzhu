// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 自动登录检查
    this.checkAutoLogin()
  },

  // 新增：自动登录检查
  checkAutoLogin() {
    const userInfo = wx.getStorageSync('userInfo')
    const studentId = wx.getStorageSync('studentId')
    const studentName = wx.getStorageSync('studentName')
    
    if (userInfo && studentId && studentName) {
      this.globalData.isLogin = true
      this.globalData.userInfo = userInfo
      this.globalData.studentId = studentId
      this.globalData.studentName = studentName
    }
  },

  globalData: {
    isLogin: false,
    userInfo: null,
    studentId: null,    // 新增：存储学号
    studentName: null,  // 新增：存储姓名
    sessionKey: null    // 新增：存储sessionKey
  }
})