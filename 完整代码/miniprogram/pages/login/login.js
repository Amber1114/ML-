// pages/login/login.js
var app = getApp();
var storage = require('../../utils/storage');

Page({
  data: {
    username: '',
    password: '',
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

  // 登录
  login: function() {
    var username = this.data.username;
    var password = this.data.password;
    
    if (!username || !password) {
      this.setData({
        errorMsg: '请输入用户名和密码'
      });
      return;
    }

    // 验证登录
    var user = storage.validateLogin(username, password);
    
    if (user) {
      // 登录成功
      app.login(user);
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
      // 跳转到首页
      setTimeout(function() {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
    } else {
      // 登录失败
      this.setData({
        errorMsg: '用户名或密码错误'
      });
    }
  },

  // 跳转到注册页面
  goToRegister: function() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  }
})