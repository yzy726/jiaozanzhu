// pages/login/login.js
const app = getApp(); // 获取全局 App 实例

Page({
  data: {
    token: null,
    isTestMode: false, // 测试模式开关
    studentId: '', // 需从用户输入或存储获取
    name: ''       // 需从用户输入或存储获取
  },

  // 登录按钮点击事件
  handleLogin: async function() {
    try {
      // 测试模式：直接模拟登录成功
      if (this.data.isTestMode) {
        this.setData({ token: "test_token_123456" });
        wx.showToast({ title: "测试登录成功", icon: "success" });

        // 模拟用户信息（测试用）
        const testUserInfo = {
          nickName: "测试用户",
          avatarUrl: "https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLkHXiaXibiaibiaibiaibiaibiaibiaiiaicg/132",
        };
        app.globalData.userInfo = testUserInfo; // 存储到全局
        wx.setStorageSync("userInfo", testUserInfo); // 同步到本地存储

        // 跳转到 my 页面
        setTimeout(() => {
          wx.switchTab({
            url: "/pages/my/my", // 确保路径正确
          });
        }, 500);
        return;
      }

      // 正式模式：获取用户信息
      const { userInfo } = await this.getUserProfile();
      const { code } = await this.getWxCode();
      const res = await this.callServerLogin(code, userInfo); // 传递用户信息给后端

      if (res.code === 0) {
        this.setData({ token: res.data.token });
        wx.setStorageSync('token', res.data.token);
        wx.showToast({ title: "登录成功", icon: "success" });

        // 存储用户信息到全局和本地
        app.globalData.userInfo = userInfo;
        wx.setStorageSync("userInfo", userInfo);

        // 跳转到 my 页面
        setTimeout(() => {
          wx.switchTab({
            url: "/pages/my/my",
          });
        }, 1500);
      } else {
        wx.showToast({ title: res.message || "登录失败", icon: "none" });
      }
    } catch (error) {
      console.error("登录失败:", error);
      wx.showToast({ title: "网络错误，请重试", icon: "none" });
    }
  },

  // 获取用户信息（需用户主动触发）
  getUserProfile: function() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: "用于完善会员资料", // 声明获取用户信息的用途
        success: (res) => resolve(res),
        fail: (err) => reject(err),
      });
    });
  },

  // 获取微信登录 code
  getWxCode: function() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) resolve(res);
          else reject(new Error("获取 code 失败"));
        },
        fail: (err) => reject(err),
      });
    });
  },
// 调用服务器登录接口（新增 userInfo 参数）
  callServerLogin: function(code, userInfo) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: "https://xinxijiaozanzhu.site/api/login", // 恢复/api前缀
        method: "POST",
        data: { 
          code, 
          userInfo,
          studentId: this.data.studentId,
          name: this.data.name 
        }, // 将用户信息传给后端
        header: { "content-type": "application/json" },
        success: (res) => {
          // 正确处理响应数据
          if (res.data.code === 0) { // 注意：微信小程序中 res.data 才是返回的数据
            // 存储 token
            this.setData({ token: res.data.token });
            
            // 存储用户信息到全局和本地
            app.globalData.userInfo = userInfo;
            app.globalData.isLogin = true;
            app.globalData.sessionKey = res.data.sessionKey;
            wx.setStorageSync('userInfo', userInfo);
            wx.setStorageSync('sessionKey', res.data.sessionKey);
            
            // 检查用户信息是否完整
            this.checkUserInfoComplete();
            
            // 返回完整响应数据
            resolve(res.data);
          } else {
            // 服务器返回错误
            wx.showToast({ 
              title: res.data.message || "登录失败", 
              icon: "none" 
            });
            reject(new Error(res.data.message || "登录失败"));
          }
        },
        fail: (err) => {
          // 网络请求失败
          wx.showToast({ 
            title: "网络错误，请重试", 
            icon: "none" 
          });
          reject(err);
        }
      });
    });
  },

  // 在callServerLogin方法后新增：
  // 检查是否需要补充用户信息
  checkUserInfoComplete() {
    const studentId = wx.getStorageSync('studentId')
    const studentName = wx.getStorageSync('studentName')
    
    if (!studentId || !studentName) {
      wx.navigateTo({
        url: '/pages/my/my?needCompleteInfo=true'
      })
    } else {
      wx.switchTab({ url: '/pages/my/my' })
    }
  },
});