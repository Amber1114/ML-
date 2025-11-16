// 测试脚本：验证财务分析页面金额显示修复
const storage = require('./miniprogram/utils/storage.js');

console.log('=== 测试财务分析页面修复 ===');

// 1. 初始化测试数据
console.log('1. 初始化测试数据...');
storage.initTestData();

// 2. 检查当前年份
const currentYear = new Date().getFullYear();
console.log(`2. 当前年份: ${currentYear}`);

// 3. 获取测试用户的交易记录
const username = 'test';
const transactions = storage.getUserTransactions(username);
console.log(`3. 测试用户交易记录数量: ${transactions.length}`);

// 4. 获取当前月份的统计数据
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;
const stats = storage.getMonthlyStatistics(username, year, month);
console.log(`4. 当前月份(${year}-${month})统计数据:`);
console.log(`   收入: ${stats.income}`);
console.log(`   支出: ${stats.expense}`);
console.log(`   余额: ${stats.balance}`);

// 5. 获取用户总资产
const totalAssets = storage.getUserTotalAssets(username);
console.log(`5. 用户总资产: ${totalAssets}`);

// 6. 获取用户总债务
const totalDebt = storage.getUserTotalDebt(username);
console.log(`6. 用户总债务: ${totalDebt}`);

// 7. 计算流动性比率
const liquidityRatio = storage.calculateLiquidityRatio(username);
console.log(`7. 流动性比率: ${liquidityRatio}`);

// 8. 计算消费多样性
const expenseDiversity = storage.calculateExpenseDiversity(username);
console.log(`8. 消费多样性: ${expenseDiversity}`);

console.log('=== 测试完成 ===');