// utils/storage.js

// 用户数据管理
const USER_KEY = 'users';
const TRANSACTION_KEY = 'transactions';

// 初始化测试数据
function initTestData() {
  // 检查是否已有用户数据
  const users = wx.getStorageSync(USER_KEY);
  if (!users || users.length === 0) {
    // 创建测试用户
    const testUser = {
      username: 'test',
      password: '123456',
      createdAt: new Date().getTime()
    };
    wx.setStorageSync(USER_KEY, [testUser]);
  }
  
  // 检查是否已有交易数据
  const transactions = wx.getStorageSync(TRANSACTION_KEY);
  if (!transactions || transactions.length === 0) {
    // 创建测试交易记录
    const testTransactions = [
      {
        id: '1',
        username: 'test',
        type: 'income',
        category: '工资',
        amount: 8000,
        date: new Date().getTime(),
        description: '月工资'
      },
      {
        id: '2',
        username: 'test',
        type: 'expense',
        category: '交通',
        amount: 200,
        date: new Date().getTime() - 86400000, // 昨天
        description: '地铁通勤'
      },
      {
        id: '3',
        username: 'test',
        type: 'expense',
        category: '购物',
        amount: 500,
        date: new Date().getTime() - 172800000, // 前天
        description: '日常购物'
      },
      {
        id: '4',
        username: 'test',
        type: 'income',
        category: '奖金',
        amount: 1000,
        date: new Date().getTime() - 259200000, // 3天前
        description: '季度奖金'
      },
      {
        id: '5',
        username: 'test',
        type: 'expense',
        category: '餐饮',
        amount: 300,
        date: new Date().getTime() - 345600000, // 4天前
        description: '吃饭'
      }
    ];
    wx.setStorageSync(TRANSACTION_KEY, testTransactions);
  }
}

// 添加用户
function addUser(user) {
  var users = wx.getStorageSync(USER_KEY) || [];
  users.push(user);
  wx.setStorageSync(USER_KEY, users);
  return true;
}

// 验证登录
function validateLogin(username, password) {
  var users = wx.getStorageSync(USER_KEY) || [];
  for (var i = 0; i < users.length; i++) {
    if (users[i].username === username && users[i].password === password) {
      return users[i];
    }
  }
  return null;
}

// 获取用户列表
function getUsers() {
  return wx.getStorageSync(USER_KEY) || [];
}

// 交易记录管理

// 添加交易记录
function addTransaction(transaction) {
  var transactions = wx.getStorageSync(TRANSACTION_KEY) || [];
  // 创建新交易对象并复制属性
  var newTransaction = {
    username: transaction.username,
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    date: transaction.date,
    description: transaction.description,
    id: Date.now().toString()
  };
  transactions.push(newTransaction);
  wx.setStorageSync(TRANSACTION_KEY, transactions);
  return true;
}

// 获取用户交易记录
function getUserTransactions(username) {
  var transactions = wx.getStorageSync(TRANSACTION_KEY) || [];
  var result = [];
  for (var i = 0; i < transactions.length; i++) {
    if (transactions[i].username === username) {
      result.push(transactions[i]);
    }
  }
  return result;
}

// 按日期筛选交易记录
function getTransactionsByDateRange(username, startDate, endDate) {
  var transactions = getUserTransactions(username);
  var result = [];
  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];
    var transactionDate = new Date(t.date).getTime();
    if (transactionDate >= startDate && transactionDate <= endDate) {
      result.push(t);
    }
  }
  return result;
}

// 获取月度收支统计
function getMonthlyStatistics(username, year, month) {
  var startDate = new Date(year, month - 1, 1).getTime();
  var endDate = new Date(year, month, 0, 23, 59, 59).getTime();
  var transactions = getTransactionsByDateRange(username, startDate, endDate);
  
  var income = 0;
  var expense = 0;
  var categoryExpenses = {};
  
  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];
    if (t.type === 'income') {
      income += parseFloat(t.amount) || 0;
    } else if (t.type === 'expense') {
      expense += parseFloat(t.amount) || 0;
      if (categoryExpenses[t.category]) {
        categoryExpenses[t.category] += parseFloat(t.amount) || 0;
      } else {
        categoryExpenses[t.category] = parseFloat(t.amount) || 0;
      }
    }
  }
  
  // 确保返回正确的数值类型
  return {
    income: parseFloat(income) || 0,
    expense: parseFloat(expense) || 0,
    balance: parseFloat(income - expense) || 0,
    categoryExpenses: categoryExpenses
  };
}

// 获取年度收支统计
function getAnnualStatistics(username, year) {
  var startDate = new Date(year, 0, 1).getTime();
  var endDate = new Date(year, 11, 31, 23, 59, 59).getTime();
  var transactions = getTransactionsByDateRange(username, startDate, endDate);
  
  var income = 0;
  var expense = 0;
  var monthlyData = {};
  
  // 初始化月度数据
  for (var month = 1; month <= 12; month++) {
    monthlyData[month] = {
      income: 0,
      expense: 0,
      balance: 0
    };
  }
  
  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];
    var transactionDate = new Date(t.date);
    var month = transactionDate.getMonth() + 1;
    
    if (t.type === 'income') {
      income += parseFloat(t.amount) || 0;
      monthlyData[month].income += parseFloat(t.amount) || 0;
    } else if (t.type === 'expense') {
      expense += parseFloat(t.amount) || 0;
      monthlyData[month].expense += parseFloat(t.amount) || 0;
    }
  }
  
  // 计算月度结余
  for (var month = 1; month <= 12; month++) {
    monthlyData[month].balance = monthlyData[month].income - monthlyData[month].expense;
  }
  
  // 确保返回正确的数值类型
  return {
    income: parseFloat(income) || 0,
    expense: parseFloat(expense) || 0,
    balance: parseFloat(income - expense) || 0,
    monthlyData: monthlyData
  };
}

// 获取稳定支出类别（排除医疗、购房、买车等大支出）
function getStableExpenseCategories(username) {
  const transactions = getUserTransactions(username);
  const categoryCounts = {};
  const categoryAmounts = {};
  
  // 定义非稳定支出类别
  const unstableCategories = ['医疗', '购房', '买车', '装修', '教育'];
  
  transactions.forEach(function(t) {
    if (t.type === 'expense' && unstableCategories.indexOf(t.category) === -1) {
      if (categoryCounts[t.category]) {
        categoryCounts[t.category]++;
        categoryAmounts[t.category] += parseFloat(t.amount) || 0;
      } else {
        categoryCounts[t.category] = 1;
        categoryAmounts[t.category] = parseFloat(t.amount) || 0;
      }
    }
  });
  
  // 计算平均支出
  const categoryAverages = {};
  for (const category in categoryCounts) {
    categoryAverages[category] = categoryAmounts[category] / categoryCounts[category];
  }
  
  return categoryAverages;
}

// 清理用户数据
function clearUserData(username) {
  // 清除用户的交易记录
  var transactions = wx.getStorageSync(TRANSACTION_KEY) || [];
  var filteredTransactions = [];
  for (var i = 0; i < transactions.length; i++) {
    if (transactions[i].username !== username) {
      filteredTransactions.push(transactions[i]);
    }
  }
  wx.setStorageSync(TRANSACTION_KEY, filteredTransactions);
  return true;
}

// 获取用户历史收入数据（过去6个月）
function getUserIncomeHistory(username, months) {
  // 设置默认参数
  months = months || 6;
  
  var today = new Date();
  var history = [];
  
  for (var i = months - 1; i >= 0; i--) {
    var targetMonth = today.getMonth() - i;
    var targetYear = targetMonth < 0 ? today.getFullYear() - 1 : today.getFullYear();
    var adjustedMonth = targetMonth < 0 ? 12 + targetMonth : targetMonth;
    
    var stats = getMonthlyStatistics(username, targetYear, adjustedMonth + 1);
    history.push({
      year: targetYear,
      month: adjustedMonth + 1,
      income: stats.income
    });
  }
  
  return history;
}

// 计算收入稳定性（过去6个月收入波动）
function calculateIncomeStability(username) {
  var incomeHistory = getUserIncomeHistory(username, 6);
  
  // 使用普通for循环替代map和filter
  var incomes = [];
  for (var i = 0; i < incomeHistory.length; i++) {
    var income = incomeHistory[i].income;
    if (income > 0) {
      incomes.push(income);
    }
  }
  
  if (incomes.length < 2) return 0;
  
  // 计算标准差
  var sum = 0;
  for (var i = 0; i < incomes.length; i++) {
    sum += incomes[i];
  }
  var mean = sum / incomes.length;
  
  var varianceSum = 0;
  for (var i = 0; i < incomes.length; i++) {
    varianceSum += Math.pow(incomes[i] - mean, 2);
  }
  var variance = varianceSum / incomes.length;
  var stdDev = Math.sqrt(variance);
  
  // 计算变异系数（相对波动）
  return stdDev / mean;
}

// 获取用户总资产（这里简化为总储蓄）
function getUserTotalAssets(username) {
  var transactions = getUserTransactions(username);
  var totalAssets = 0;
  
  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];
    if (t.type === 'income') {
      totalAssets += parseFloat(t.amount);
    } else {
      totalAssets -= parseFloat(t.amount);
    }
  }
  
  return Math.max(0, totalAssets); // 确保资产不为负
}

// 获取用户总债务（这里简化处理，实际应用中需要专门的债务记录）
function getUserTotalDebt(username) {
  // 这里简化处理，实际应用中需要添加债务管理功能
  return 0;
}

// 计算流动性比率（流动资产/每月支出）
function calculateLiquidityRatio(username) {
  const totalAssets = getUserTotalAssets(username);
  const today = new Date();
  const monthlyStats = getMonthlyStatistics(username, today.getFullYear(), today.getMonth() + 1);
  
  if (monthlyStats.expense === 0) return 0;
  
  return totalAssets / monthlyStats.expense;
}

// 计算消费多样性（消费类别数量）
function calculateExpenseDiversity(username) {
  var transactions = getUserTransactions(username);
  var categories = [];
  
  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];
    if (t.type === 'expense' && t.category) {
      // 使用indexOf检查类别是否已存在
      if (categories.indexOf(t.category) === -1) {
        categories.push(t.category);
      }
    }
  }
  
  return categories.length;
}

module.exports = {
  initTestData,
  addUser,
  validateLogin,
  getUsers,
  addTransaction,
  getUserTransactions,
  getTransactionsByDateRange,
  getMonthlyStatistics,
  getAnnualStatistics,
  getStableExpenseCategories,
  clearUserData,
  getUserIncomeHistory,
  calculateIncomeStability,
  getUserTotalAssets,
  getUserTotalDebt,
  calculateLiquidityRatio,
  calculateExpenseDiversity
};