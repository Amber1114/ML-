// pages/index/index.js
const app = getApp();
const storage = require('../../utils/storage');

Page({
  data: {
    userInfo: null,
    currentMonth: '',
    income: 0,
    expense: 0,
    balance: 0,
    recentTransactions: []
  },

  onLoad() {
    // 初始化测试数据（包括用户和交易记录）
    storage.initTestData();
  },

  onShow() {
    this.updateData();
  },

  updateData() {
    var userInfo = app.globalData.userInfo;
    if (!userInfo) {
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return;
    }

    // 设置当前月份
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    // 手动补零
    var monthStr = month < 10 ? '0' + month : month;
    var currentMonth = year + '-' + monthStr;

    // 获取月度统计数据
    const stats = storage.getMonthlyStatistics(userInfo.username, year, today.getMonth() + 1);

    // 获取最近5条交易记录
    var allTransactions = storage.getUserTransactions(userInfo.username);
    allTransactions.sort(function(a, b) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    var recentTransactions = [];
    for (var i = 0; i < Math.min(5, allTransactions.length); i++) {
      var item = allTransactions[i];
      // 格式化日期
      var date = new Date(item.date);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      // 补零
      var monthStr = month < 10 ? '0' + month : month;
      var dayStr = day < 10 ? '0' + day : day;
      var dateFormat = year + '-' + monthStr + '-' + dayStr;
      
      var newItem = {
        id: item.id,
        type: item.type,
        amount: parseFloat(item.amount).toFixed(2),
        category: item.category,
        description: item.description,
        date: item.date,
        dateFormat: dateFormat
      };
      recentTransactions.push(newItem);
    }

    this.setData({
      userInfo: userInfo,
      currentMonth: currentMonth,
      income: parseFloat(stats.income).toFixed(2),
      expense: parseFloat(stats.expense).toFixed(2),
      balance: parseFloat(stats.balance).toFixed(2),
      recentTransactions: recentTransactions
    });
  },

  // 跳转到添加记录页面
  goToAdd() {
    wx.navigateTo({
      url: '/pages/transaction/add/add'
    });
  },

  // 跳转到交易记录列表页面
  goToTransactionList() {
    wx.navigateTo({
      url: '/pages/transaction/list/list'
    });
  },

  // 跳转到财务分析页面
  goToAnalysis() {
    wx.navigateTo({
      url: '/pages/analysis/report/report'
    });
  }
})