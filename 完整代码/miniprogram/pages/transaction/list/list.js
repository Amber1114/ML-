// pages/transaction/list/list.js
const app = getApp();
const storage = require('../../../utils/storage');

Page({
  data: {
    transactions: [],
    filteredTransactions: [],
    filterType: 'all', // all, income, expense
    currentPage: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadTransactions();
  },

  onShow() {
    // 页面显示时重新加载数据
    this.setData({
      currentPage: 1,
      hasMore: true
    });
    this.loadTransactions();
  },

  // 加载交易记录
  loadTransactions() {
    var userInfo = app.globalData.userInfo;
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

    console.log('当前登录用户信息:', userInfo);
    console.log('获取用户交易记录，用户名:', userInfo.username);
    
    var currentPage = this.data.currentPage;
    var pageSize = this.data.pageSize;
    var filterType = this.data.filterType;
    
    // 获取所有交易记录
    var allTransactions = storage.getUserTransactions(userInfo.username);
    console.log('原始交易记录:', allTransactions);
    
    // 按日期排序（最新的在前）
    allTransactions.sort(function(a, b) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // 筛选
    var filtered = allTransactions;
    if (filterType !== 'all') {
      filtered = [];
      for (var i = 0; i < allTransactions.length; i++) {
        if (allTransactions[i].type === filterType) {
          filtered.push(allTransactions[i]);
        }
      }
    }
    
    // 分页并处理金额和日期
    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = startIndex + pageSize;
    var paginated = [];
    for (var i = startIndex; i < endIndex && i < filtered.length; i++) {
      var item = filtered[i];
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
        amount: parseFloat(item.amount),
        category: item.category,
        description: item.description,
        date: item.date,
        dateFormat: dateFormat
      };
      paginated.push(newItem);
    }
    
    this.setData({
      transactions: paginated,
      filteredTransactions: filtered,
      hasMore: endIndex < filtered.length,
      loading: false
    });
  },

  // 切换筛选类型
  switchFilter(e) {
    const filterType = e.currentTarget.dataset.type;
    this.setData({
      filterType: filterType,
      currentPage: 1,
      hasMore: true
    });
    this.loadTransactions();
  },

  // 加载更多
  loadMore() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({
      currentPage: this.data.currentPage + 1,
      loading: true
    });
    
    var userInfo = app.globalData.userInfo;
    var currentPage = this.data.currentPage;
    var pageSize = this.data.pageSize;
    var filterType = this.data.filterType;
    var filteredTransactions = this.data.filteredTransactions;
    
    // 分页加载更多并处理金额和日期
    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = startIndex + pageSize;
    var moreTransactions = [];
    for (var i = startIndex; i < endIndex && i < filteredTransactions.length; i++) {
      var item = filteredTransactions[i];
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
        amount: parseFloat(item.amount),
        category: item.category,
        description: item.description,
        date: item.date,
        dateFormat: dateFormat
      };
      moreTransactions.push(newItem);
    }
    
    // 合并数组
    var updatedTransactions = this.data.transactions.concat(moreTransactions);
    
    this.setData({
      transactions: updatedTransactions,
      hasMore: endIndex < filteredTransactions.length,
      loading: false
    });
  },

  // 跳转到添加记录页面
  goToAdd() {
    wx.navigateTo({
      url: '/pages/transaction/add/add'
    });
  }
})