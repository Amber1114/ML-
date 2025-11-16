// pages/transaction/add/add.js
const app = getApp();
const storage = require('../../../utils/storage');

Page({
  data: {
    transactionType: 'expense', // 默认支出
    amount: '',
    category: '',
    description: '',
    date: '',
    errorMsg: '',
    // 支出分类
    expenseCategories: [
      { name: '餐饮', icon: '🍚' },
      { name: '交通', icon: '🚗' },
      { name: '购物', icon: '🛒' },
      { name: '娱乐', icon: '🎮' },
      { name: '医疗', icon: '🏥' },
      { name: '教育', icon: '📚' },
      { name: '住房', icon: '🏠' },
      { name: '其他', icon: '📦' }
    ],
    // 收入分类
    incomeCategories: [
      { name: '工资', icon: '💰' },
      { name: '奖金', icon: '🎁' },
      { name: '投资', icon: '📈' },
      { name: '兼职', icon: '💼' },
      { name: '其他', icon: '📦' }
    ]
  },

  onLoad() {
    // 设置默认日期为今天
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();
    // 手动补零
    var monthStr = month < 10 ? '0' + month : month;
    var dayStr = day < 10 ? '0' + day : day;
    this.setData({
      date: year + '-' + monthStr + '-' + dayStr
    });
  },

  // 切换交易类型
  switchType(e) {
    this.setData({
      transactionType: e.currentTarget.dataset.type,
      category: '' // 切换类型时清空分类选择
    });
  },

  // 输入金额
  onAmountInput(e) {
    this.setData({
      amount: e.detail.value
    });
  },

  // 选择分类
  selectCategory(e) {
    this.setData({
      category: e.currentTarget.dataset.category
    });
  },

  // 输入描述
  onDescriptionInput(e) {
    this.setData({
      description: e.detail.value
    });
  },

  // 选择日期
  onDateChange(e) {
    this.setData({
      date: e.detail.value
    });
  },

  // 保存交易记录
  saveTransaction() {
    const { transactionType, amount, category, description, date } = this.data;
    const { userInfo } = app.globalData;
    
    // 验证输入
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      this.setData({
        errorMsg: '请输入有效的金额'
      });
      return;
    }
    
    if (!category) {
      this.setData({
        errorMsg: '请选择分类'
      });
      return;
    }
    
    if (!date) {
      this.setData({
        errorMsg: '请选择日期'
      });
      return;
    }
    
    // 创建交易记录
    const transaction = {
      username: userInfo.username,
      type: transactionType,
      amount: parseFloat(amount),
      category: category,
      description: description,
      date: date,
      createdAt: new Date().getTime()
    };
    
    // 保存到本地存储
    storage.addTransaction(transaction);
    
    wx.showToast({
      title: '记录成功',
      icon: 'success'
    });
    
    // 返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
})