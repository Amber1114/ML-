// 测试数据初始化脚本
const { initTestData, addTransaction, getMonthlyStatistics } = require('./miniprogram/utils/storage.js');

// 初始化测试数据
initTestData();

// 测试用户
const testUser = 'test';

// 添加测试交易数据（过去6个月）
const months = [
  { year: 2023, month: 6, income: 8000, expenses: [1500, 1000, 500, 800, 200] },
  { year: 2023, month: 7, income: 8500, expenses: [1400, 1100, 550, 750, 250] },
  { year: 2023, month: 8, income: 8200, expenses: [1600, 950, 450, 850, 180] },
  { year: 2023, month: 9, income: 8800, expenses: [1300, 1200, 600, 700, 300] },
  { year: 2023, month: 10, income: 8300, expenses: [1550, 1050, 520, 820, 220] },
  { year: 2023, month: 11, income: 9000, expenses: [1450, 1150, 580, 780, 280] }
];

months.forEach(monthData => {
  // 添加收入
  addTransaction({
    username: testUser,
    type: 'income',
    amount: monthData.income,
    category: '工资',
    date: new Date(monthData.year, monthData.month - 1, 15).getTime(),
    description: '月工资'
  });
  
  // 添加支出
  const categories = ['餐饮', '交通', '购物', '娱乐', '其他'];
  monthData.expenses.forEach((expense, index) => {
    addTransaction({
      username: testUser,
      type: 'expense',
      amount: expense,
      category: categories[index],
      date: new Date(monthData.year, monthData.month - 1, 10 + index).getTime(),
      description: `${categories[index]}支出`
    });
  });
});

// 测试获取月度统计
const stats = getMonthlyStatistics(testUser, 2023, 11);
console.log('月度统计:', stats);