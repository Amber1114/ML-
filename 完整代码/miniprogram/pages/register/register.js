// pages/register/register.js
var storage = require('../../utils/storage');

Page({
  data: {
    username: '',
    password: '',
    confirmPassword: '',
    errorMsg: ''
  },

  // 输入用户名
  onUsernameInput: function(e) {
    this.setData({
      username: e.detail.value
    });
  },

  // 输入密码
  onPasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 确认密码
  onConfirmPasswordInput: function(e) {
    this.setData({
      confirmPassword: e.detail.value
    });
  },

  // 注册
  register: function() {
    var username = this.data.username;
    var password = this.data.password;
    var confirmPassword = this.data.confirmPassword;
    
    // 验证输入
    if (!username || !password || !confirmPassword) {
      this.setData({
        errorMsg: '请填写所有字段'
      });
      return;
    }
    
    if (password !== confirmPassword) {
      this.setData({
        errorMsg: '两次输入的密码不一致'
      });
      return;
    }
    
    if (password.length < 6) {
      this.setData({
        errorMsg: '密码长度不能少于6位'
      });
      return;
    }
    
    // 检查用户名是否已存在
    var users = storage.getUsers();
    var usernameExists = false;
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username) {
        usernameExists = true;
        break;
      }
    }
    
    if (usernameExists) {
      this.setData({
        errorMsg: '用户名已存在'
      });
      return;
    }
    
    // 创建新用户
    var newUser = {
      username: username,
      password: password,
      createdAt: new Date().getTime()
    };
    
    // 保存用户数据
    storage.addUser(newUser);
    
    // 为新用户添加测试交易数据
    var currentYear = new Date().getFullYear();
    var months = [
      { year: currentYear, month: 6, income: 8000, expenses: [1500, 1000, 500, 800, 200] },
      { year: currentYear, month: 7, income: 8500, expenses: [1400, 1100, 550, 750, 250] },
      { year: currentYear, month: 8, income: 8200, expenses: [1600, 950, 450, 850, 180] },
      { year: currentYear, month: 9, income: 8800, expenses: [1300, 1200, 600, 700, 300] },
      { year: currentYear, month: 10, income: 8300, expenses: [1550, 1050, 520, 820, 220] },
      { year: currentYear, month: 11, income: 9000, expenses: [1450, 1150, 580, 780, 280] }
    ];
    
    // 使用for循环添加测试交易数据
    for (var i = 0; i < months.length; i++) {
      var monthData = months[i];
      // 添加收入
      storage.addTransaction({
        username: username,
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
          username: username,
          type: 'expense',
          amount: expense,
          category: categories[j],
          date: new Date(monthData.year, monthData.month - 1, 10 + j).getTime(),
          description: categories[j] + '支出'
        });
      }
    }
    
    // 注册成功
    wx.showToast({
      title: '注册成功',
      icon: 'success'
    });
    
    // 跳转到登录页面
    setTimeout(function() {
      wx.navigateBack();
    }, 1500);
  },

  // 返回登录页面
  goToLogin: function() {
    wx.navigateBack();
  }
})