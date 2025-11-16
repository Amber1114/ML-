// pages/profile/index/index.js
const app = getApp();
const storage = require('../../../utils/storage');

Page({
  data: {
    userInfo: null,
    statistics: {
      totalTransactions: 0,
      totalIncome: 0,
      totalExpense: 0,
      registeredDays: 0
    }
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    var userInfo = app.globalData.userInfo;
    if (!userInfo) {
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return;
    }

    this.setData({
      userInfo: userInfo
    });

    // 加载用户统计数据
    this.loadUserStatistics(userInfo.username);
  },

  // 加载用户统计数据
  loadUserStatistics(username) {
    // 获取所有交易记录
    console.log('个人中心-获取用户交易记录，用户名:', username);
    var transactions = storage.getUserTransactions(username);
    console.log('个人中心-原始交易记录:', transactions);
    
    // 计算统计数据（使用普通for循环替代filter和reduce）
    var totalIncome = 0;
    for (var i = 0; i < transactions.length; i++) {
      var t = transactions[i];
      if (t.type === 'income') {
        totalIncome += parseFloat(t.amount);
      }
    }
    
    var totalExpense = 0;
    for (var i = 0; i < transactions.length; i++) {
      var t = transactions[i];
      if (t.type === 'expense') {
        totalExpense += parseFloat(t.amount);
      }
    }
    
    // 计算注册天数（使用普通for循环替代find）
    var users = storage.getUsers();
    var userData = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username) {
        userData = users[i];
        break;
      }
    }
    var registeredDays = userData ? this.calculateDays(userData.createdAt) : 0;

    this.setData({
      statistics: {
        totalTransactions: transactions.length,
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        registeredDays: registeredDays
      }
    });
  },

  // 计算天数差
  calculateDays(dateString) {
    const registeredDate = new Date(dateString);
    const today = new Date();
    const timeDiff = today.getTime() - registeredDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  },

  // 清除所有数据
  clearAllData() {
    var that = this;
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有数据吗？此操作不可恢复！',
      success: function(res) {
        if (res.confirm) {
          // 清除当前用户的所有交易记录
          storage.clearUserData(that.data.userInfo.username);
          
          wx.showToast({
            title: '数据已清除',
            icon: 'success',
            duration: 2000
          });
          
          // 重新加载统计数据
          that.loadUserStatistics(that.data.userInfo.username);
        }
      }
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除全局用户信息
          app.globalData.userInfo = null;
          
          // 清除本地存储的登录状态
          wx.removeStorageSync('loggedInUser');
          
          // 跳转到登录页面
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }
      }
    });
  }
})