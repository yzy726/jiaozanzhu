// page/my.js
const app = getApp();

Page({
  data: {
    userInfo: null,        // 用户信息（昵称、头像）
    studentId: '',         // 学号
    studentName: '',       // 姓名
    showCodeInput: false,  // 显示校验码输入弹窗
    inputCode: '',         // 输入的校验码
    codeInputType: '',     // 校验码输入类型（name/studentId）
    isNameBound: false,    // 姓名是否绑定
    isStudentIdBound: false // 学号是否绑定
  },

  onLoad(options) {
    // 加载用户信息
    this.loadUserInfo();
    
    // 检查是否需要完善信息（首次登录）
    if (options.needCompleteInfo) {
      this.checkAndCompleteInfo();
    }
  },

  // 检查并完善信息
  checkAndCompleteInfo() {
    const { isNameBound, isStudentIdBound } = this.data;
    
    if (!isNameBound && !isStudentIdBound) {
      wx.showModal({
        title: '完善信息',
        content: '请补充您的姓名和学号',
        showCancel: false,
        success: () => {
          this.inputStudentName(); // 先完善姓名
        }
      });
    } else if (!isNameBound) {
      wx.showModal({
        title: '完善信息',
        content: '请补充您的姓名',
        showCancel: false,
        success: () => {
          this.inputStudentName();
        }
      });
    } else if (!isStudentIdBound) {
      wx.showModal({
        title: '完善信息',
        content: '请补充您的学号',
        showCancel: false,
        success: () => {
          this.inputStudentId();
        }
      });
    }
  },

  // 加载用户信息（从本地存储和全局数据）
  loadUserInfo() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync("userInfo") || null;
    const studentId = wx.getStorageSync('studentId') || '';
    const studentName = wx.getStorageSync('studentName') || '';
    
    this.setData({
      userInfo,
      studentId,
      studentName,
      isNameBound: !!studentName,        // 姓名绑定状态
      isStudentIdBound: !!studentId      // 学号绑定状态
    });
  },

  // 修改姓名
  inputStudentName() {
    // 姓名未绑定：直接修改
    if (!this.data.isNameBound) {
      this.realInputStudentName();
      return;
    }
    
    // 姓名已绑定：需校验码
    this.setData({
      showCodeInput: true,
      codeInputType: 'name',
      inputCode: ''
    });
  },

  // 修改学号
  inputStudentId() {
    // 学号未绑定：直接修改
    if (!this.data.isStudentIdBound) {
      this.realInputStudentId();
      return;
    }
    
    // 学号已绑定：需校验码
    this.setData({
      showCodeInput: true,
      codeInputType: 'studentId',
      inputCode: ''
    });
  },

  // 绑定校验码输入
  bindCodeInput(e) {
    this.setData({ inputCode: e.detail.value });
  },

  // 取消校验码输入
  cancelCodeInput() {
    this.setData({ showCodeInput: false, inputCode: '' });
  },

  // 确认校验码输入（直接提交用户输入的校验码到后端验证）
  confirmCodeInput() {
    const { inputCode, codeInputType } = this.data;
    const token = wx.getStorageSync('token');
    
    if (!inputCode || inputCode.length !== 6) {
      wx.showToast({ title: '请输入6位校验码', icon: 'none' });
      return;
    }

    // 验证校验码（后端比对数据库中的校验码）
    wx.request({
      url: 'https://xinxijiaozanzhu.site/api/verify-code',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'content-type': 'application/json'
      },
      data: { verificationCode: inputCode },
      success: (res) => {
        if (res.data.code === 0) {
          // 校验码正确，继续输入姓名或学号
          if (codeInputType === 'name') {
            this.realInputStudentName();
          } else {
            this.realInputStudentId();
          }
        } else {
          wx.showToast({ title: res.data.message || '校验码错误或已过期', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  // 实际输入姓名
  realInputStudentName() {
    wx.showModal({
      title: this.data.isNameBound ? '修改姓名' : '设置姓名',
      editable: true,
      placeholderText: '请输入真实姓名',
      success: (res) => {
        if (!res.confirm) return;
        
        const studentName = res.content?.trim() || '';
        if (!studentName) {
          wx.showToast({ title: '姓名不能为空', icon: 'none' });
          return;
        }

        if (/^[\u4e00-\u9fa5]{2,8}$/.test(studentName)) {
          this.setData({ 
            studentName,
            isNameBound: true // 更新姓名绑定状态
          });
          wx.setStorageSync('studentName', studentName);
          app.globalData.studentName = studentName;
          this.updateUserInfoAndGenerateCode(); // 更新用户信息并刷新校验码
          wx.showToast({ title: this.data.isNameBound ? '姓名已更新' : '姓名已设置', icon: 'success' });
          this.cancelCodeInput();
        } else {
          wx.showToast({ title: '请输入2-8个汉字', icon: 'none' });
        }
      }
    });
  },

  // 实际输入学号
  realInputStudentId() {
    wx.showModal({
      title: this.data.isStudentIdBound ? '修改学号' : '设置学号',
      editable: true,
      placeholderText: '请输入8位数字学号',
      success: (res) => {
        if (!res.confirm) return;
        
        const studentId = res.content?.trim() || '';
        if (!studentId) {
          wx.showToast({ title: '学号不能为空', icon: 'none' });
          return;
        }

        if (/^\d{8}$/.test(studentId)) {
          this.setData({ 
            studentId,
            isStudentIdBound: true // 更新学号绑定状态
          });
          wx.setStorageSync('studentId', studentId);
          app.globalData.studentId = studentId;
          this.updateUserInfoAndGenerateCode(); // 更新用户信息并刷新校验码
          wx.showToast({ title: this.data.isStudentIdBound ? '学号已更新' : '学号已设置', icon: 'success' });
          this.cancelCodeInput();
        } else {
          wx.showToast({ title: '请输入8位数字', icon: 'none' });
        }
      }
    });
  },

  // 更新用户信息并生成新校验码
  updateUserInfoAndGenerateCode() {
    const token = wx.getStorageSync('token');
    const { studentId, studentName } = this.data;
    
    if (!token) return;

    // 调用后端接口更新用户信息并刷新校验码
    wx.request({
      url: 'https://xinxijiaozanzhu.site/api/update-user-info',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'content-type': 'application/json'
      },
      data: {
        studentId,
        name: studentName
      },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({ title: '信息更新成功', icon: 'success' });
        } else {
          wx.showToast({ title: res.data.message || '更新失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  // 退出登录
  handleLogout() {
    // 清除所有用户相关数据
    this.setData({
      userInfo: null,
      studentId: '',
      studentName: '',
      isNameBound: false,
      isStudentIdBound: false
    });
    
    app.globalData.userInfo = null;
    wx.removeStorageSync("userInfo");
    wx.removeStorageSync("studentId");
    wx.removeStorageSync("studentName");
    wx.removeStorageSync("token");
    
    wx.showToast({ title: '已退出登录', icon: 'success' });
    
    setTimeout(() => {
      wx.redirectTo({ url: '/pages/index/index' });
    }, 1500);
  }
});