// pages/load/load.js
const util = require('../../utils/util.js');

Page({
  data: {
    avatarPath: '',     // 本地选择的图片路径
    userInfo: null,     // 用户信息
    studentName: '',    // 姓名
    studentId: '',      // 学号
    isUploading: false,  // 防止重复提交
    dateList: [],       // 日期文件夹列表
    dateIndex: 0,       // 选中的日期索引
    selectedDate: '',   // 选中的日期
    password: '',        // 下载密码
    isGenerating: false,   // 链接生成状态
  },

  onLoad: function(options) {
    // 从全局或本地存储获取用户信息
    const app = getApp();
    this.setData({
      studentName: app.globalData.studentName || wx.getStorageSync('studentName'),
      studentId: app.globalData.studentId || wx.getStorageSync('studentId'),
      userInfo: app.globalData.userInfo || wx.getStorageSync('userInfo')
    });
    // 获取日期文件夹列表
    this.getFolderList();
  },

  // 选择图片（使用wx.chooseMedia替换wx.chooseImage）
  chooseImage: function() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'], // 仅允许选择图片
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 获取选中图片的临时路径
        this.setData({
          avatarPath: res.tempFiles[0].tempFilePath
        });
      },
      fail: (err) => {
        console.error('选择图片失败', err);
        wx.showToast({ title: '选择图片失败', icon: 'none' });
      }
    });
  },

  // 获取日期文件夹列表
  getFolderList() {
    wx.request({
      url: 'https://xinxijiaozanzhu.site/api/folders',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            dateList: res.data.data.folders,
            selectedDate: res.data.data.folders[0] || ''
          });
        } else {
          wx.showToast({ title: res.data.message || '获取列表失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  // 选择日期变化
  bindDateChange(e) {
    const index = e.detail.value;
    this.setData({
      dateIndex: index,
      selectedDate: this.data.dateList[index]
    });
  },

  // 输入密码
  inputPassword(e) {
    this.setData({ password: e.detail.value });
  },

  // 下载文件夹
  downloadFolder() {
    const { selectedDate, password } = this.data;
    
    wx.request({
      url: 'https://xinxijiaozanzhu.site/api/download',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: {
        date: selectedDate,
        password: password
      },
      responseType: 'arraybuffer',
      success: (res) => {
        // 保存文件
        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success: (saveRes) => {
            wx.showToast({ title: '下载成功', icon: 'success' });
            // 打开文件
            wx.openDocument({
              filePath: saveRes.savedFilePath,
              success: (openRes) => {
                console.log('文件打开成功');
              }
            });
          }
        });
      },
      fail: (err) => {
        wx.showToast({ title: '下载失败', icon: 'none' });
      }
    });
  },

  // 上传数据到服务器
  uploadData: function() {
    const { avatarPath, studentName, studentId, isUploading } = this.data;
    const app = getApp();
    const token = wx.getStorageSync('token');
  
    // 验证步骤
    if (isUploading) {
      wx.showToast({ title: '上传中，请稍候', icon: 'none' });
      return;
    }
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    if (!avatarPath) {
      wx.showToast({ title: '请先选择图片', icon: 'none' });
      return;
    }
    if (!studentName || !studentId) {
      wx.showToast({ title: '请先完善个人信息', icon: 'none' });
      return;
    }
  
    this.setData({ isUploading: true });
    wx.showLoading({ title: '上传中...', mask: true });
  
    // 生成文件名
    const uploadTime = util.formatDateTimeForFileName(new Date());
    const fileName = `${uploadTime}_${studentName}_${studentId}.jpg`;
  
    // 上传图片
    wx.uploadFile({
      url: 'https://xinxijiaozanzhu.site/api/upload', // 替换为实际URL
      filePath: this.data.avatarPath, // 修复：使用正确的图片路径
      name: 'image',
      formData: { fileName: fileName },
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 0) {
          wx.showToast({ title: '上传成功', icon: 'success' });
        } else {
          wx.showToast({ title: data.message || '上传失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('上传失败', err);
        wx.showToast({ title: '网络错误，请重试', icon: 'none' });
      },
      complete: () => {
        this.setData({ isUploading: false });
        wx.hideLoading();
      }
    });
  },
  // 获取日期文件夹列表（添加详细调试）
  getFolderList() {
    wx.showLoading({ title: '加载日期列表...' });
    
    wx.request({
      url: 'https://xinxijiaozanzhu.site/api/folders',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        console.log('文件夹列表接口返回:', res.data); // 添加调试日志
        
        if (res.data.code === 0) {
          this.setData({
            dateList: res.data.data.folders || [],
            dateIndex: 0,
            selectedDate: (res.data.data.folders || [])[0] || ''
          });
          
          // 显示调试信息
          if (res.data.data.folders && res.data.data.folders.length === 0) {
            wx.showToast({ 
              title: '未找到任何日期文件夹', 
              icon: 'none',
              duration: 3000
            });
          }
        } else {
          wx.showModal({
            title: '获取日期列表失败',
            content: `错误信息: ${res.data.message || '未知错误'}\n调试信息: ${JSON.stringify(res.data.debug || {})}`,
            showCancel: false
          });
        }
      },
      fail: (err) => {
        console.error('请求文件夹列表失败:', err);
        wx.showModal({
          title: '网络错误',
          content: `无法连接到服务器，请检查网络连接\n错误: ${err.errMsg}`,
          showCancel: false
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },
  // 新增：生成下载链接方法
  generateDownloadLink() {
    const { selectedDate, password } = this.data;
    
    if (!selectedDate || !password) {
      wx.showToast({ title: '请选择日期并输入密码', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '生成下载链接中...' });
    
    wx.request({
      url: 'https://xinxijiaozanzhu.site/api/generate-link',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: { date: selectedDate, password },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            downloadLink: res.data.data.downloadLink,
            expireTime: res.data.data.expireTime,
            showLink: true
          });
        } else {
          wx.showToast({ title: res.data.message || '生成链接失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误，请重试', icon: 'none' });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

// 新增：复制链接方法
  copyLink() {
    wx.setClipboardData({
      data: this.data.downloadLink,
      success: () => {
        wx.showToast({ title: '链接已复制', icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '复制失败，请手动复制', icon: 'none' });
      }
    });
  }
});
