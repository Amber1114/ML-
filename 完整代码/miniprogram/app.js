// app.js
var storage = require('./utils/storage.js');

App({
  globalData: {
    userInfo: null,
    isLoggedIn: false
  },
  onLaunch: function() {
    // 初始化测试数据
    storage.initTestData();
    
    // 添加测试交易数据
    this.initTestTransactions();
    
    // 检查登录状态
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.isLoggedIn = true;
    }
  },
  login: function(userInfo) {
    this.globalData.userInfo = userInfo;
    this.globalData.isLoggedIn = true;
    wx.setStorageSync('userInfo', userInfo);
  },
  logout: function() {
    this.globalData.userInfo = null;
    this.globalData.isLoggedIn = false;
    wx.removeStorageSync('userInfo');
  },
  
  // 初始化测试交易数据
  initTestTransactions: function() {
    var testUser = 'test';
    
    // 检查是否已有交易数据
    var transactions = wx.getStorageSync('transactions') || [];
    if (transactions.length > 0) {
      return; // 已有数据，不再添加
    }
    
    // 添加测试交易数据（过去6个月）
    var currentYear = new Date().getFullYear();
    var months = [
      { year: currentYear, month: 6, income: 8000, expenses: [1500, 1000, 500, 800, 200] },
      { year: currentYear, month: 7, income: 8500, expenses: [1400, 1100, 550, 750, 250] },
      { year: currentYear, month: 8, income: 8200, expenses: [1600, 950, 450, 850, 180] },
      { year: currentYear, month: 9, income: 8800, expenses: [1300, 1200, 600, 700, 300] },
      { year: currentYear, month: 10, income: 8300, expenses: [1550, 1050, 520, 820, 220] },
      { year: currentYear, month: 11, income: 9000, expenses: [1450, 1150, 580, 780, 280] }
    ];
    
    // 使用for循环替代forEach
    for (var i = 0; i < months.length; i++) {
      var monthData = months[i];
      // 添加收入
      storage.addTransaction({
        username: testUser,
        type: 'income',
        amount: monthData.income,
        category: '工资',
        date: new Date(monthData.year, monthData.month - 1, 15).getTime(),
        description: '月工资'
      });
      
      // 添加支出
      var categories = ['餐饮', '交通', '购物', '娱乐', '其他'];
      for (var j = 0; j < monthData.expenses.length; j++) {
        var expense = monthData.expenses[j];
        storage.addTransaction({
          username: testUser,
          type: 'expense',
          amount: expense,
          category: categories[j],
          date: new Date(monthData.year, monthData.month - 1, 10 + j).getTime(),
          description: categories[j] + '支出'
        });
      }
    }
  }
})