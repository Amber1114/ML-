// pages/analysis/report/report.js
const app = getApp();
const storage = require('../../../utils/storage');

Page({
  data: {
    userInfo: null,
    currentMonth: '',
    currentYear: '',
    stats: {
      income: 0,
      expense: 0,
      balance: 0,
      categoryExpenses: {}
    },
    annualStats: {
      income: 0,
      expense: 0,
      balance: 0,
      monthlyData: {}
    },
    nextMonthPrediction: {
      predictedIncome: 0,
      predictedExpense: 0,
      predictedBalance: 0,
      stableExpenses: {}
    },
    healthScore: 0,
    healthLevel: '',
    assessmentDetails: {
      incomeStructureScore: 0,
      savingsRate: 0,
      incomeStability: 0,
      expenseRatio: 0,
      assetLiabilityScore: 0,
      totalAssets: 0,
      totalDebt: 0,
      debtToIncomeRatio: 0,
      financialSecurityScore: 0,
      emergencyFundMonths: 0,
      liquidityRatio: 0,
      consumptionBehaviorScore: 0,
      expenseDiversity: 0,
      longTermPlanningScore: 0,
      assetToIncomeRatio: 0
    },
    aiAdvice: [],
    nextMonthAdvice: [],
    chartData: {
      categoryData: [],
      trendData: []
    }
  },

  onLoad() {
    this.updateAnalysis();
  },

  onShow() {
    this.updateAnalysis();
  },

  updateAnalysis() {
    var userInfo = app.globalData.userInfo;
    if (!userInfo) {
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return;
    }

    // 设置当前月份和年份
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    // 手动补零
    var monthStr = month < 10 ? '0' + month : month;
    var currentMonth = year + '-' + monthStr;
    var currentYear = year.toString();

    // 获取月度统计数据
    var stats = storage.getMonthlyStatistics(userInfo.username, year, month);
    
    // 格式化数值为两位小数
    stats.income = parseFloat(stats.income || 0).toFixed(2);
    stats.expense = parseFloat(stats.expense || 0).toFixed(2);
    stats.balance = parseFloat(stats.balance || 0).toFixed(2);

    // 获取年度统计数据
    var annualStats = storage.getAnnualStatistics(userInfo.username, year);
    annualStats.income = parseFloat(annualStats.income || 0).toFixed(2);
    annualStats.expense = parseFloat(annualStats.expense || 0).toFixed(2);
    annualStats.balance = parseFloat(annualStats.balance || 0).toFixed(2);

    // 预测下个月收支情况
    var nextMonthPrediction = this.predictNextMonth(userInfo.username, year, month);

    // 生成下个月的建议
    var nextMonthAdvice = this.generateNextMonthAdvice(nextMonthPrediction);

    // 计算财务健康评分
    var healthAssessment = this.calculateHealthScore(stats, userInfo.username);
    var healthScore = healthAssessment.totalScore;
    var healthLevel = this.getHealthLevel(healthScore);
    var assessmentDetails = healthAssessment.assessmentDetails;

    // 生成AI建议
    var aiAdvice = this.generateAIAdvice(stats, healthScore);

    // 准备图表数据
    var chartData = this.prepareChartData(userInfo.username, year, month);

    this.setData({
      userInfo: userInfo,
      currentMonth: currentMonth,
      currentYear: currentYear,
      stats: stats,
      annualStats: annualStats,
      nextMonthPrediction: nextMonthPrediction,
      healthScore: healthScore,
      healthLevel: healthLevel,
      assessmentDetails: assessmentDetails,
      aiAdvice: aiAdvice,
      nextMonthAdvice: nextMonthAdvice,
      chartData: chartData
    }, function() {
      // 数据更新后绘制图表
      this.drawCategoryChart();
      this.drawTrendChart();
    }.bind(this));
  },

  // 预测下个月收支情况
  predictNextMonth(username, year, month) {
    // 获取稳定支出类别和平均支出
    var stableExpenseCategories = storage.getStableExpenseCategories(username);
    
    // 计算总稳定支出
    var totalStableExpense = 0;
    for (var category in stableExpenseCategories) {
      if (stableExpenseCategories.hasOwnProperty(category)) {
        totalStableExpense += stableExpenseCategories[category];
      }
    }
    
    // 获取最近3个月的收入数据，预测下个月收入
    var recentIncome = [];
    for (var i = 0; i < 3; i++) {
      var targetMonth = month - i;
      var targetYear = targetMonth < 1 ? year - 1 : year;
      var targetMonthAdjusted = targetMonth < 1 ? targetMonth + 12 : targetMonth;
      var monthlyStats = storage.getMonthlyStatistics(username, targetYear, targetMonthAdjusted);
      recentIncome.push(monthlyStats.income);
    }
    
    // 计算平均收入作为预测收入（使用普通for循环替代reduce）
    var sumIncome = 0;
    for (var i = 0; i < recentIncome.length; i++) {
      sumIncome += recentIncome[i];
    }
    var avgIncome = sumIncome / recentIncome.length;
    
    // 格式化预测数据
    var predictedIncome = parseFloat(avgIncome).toFixed(2);
    var predictedExpense = parseFloat(totalStableExpense).toFixed(2);
    var predictedBalance = parseFloat(predictedIncome - predictedExpense).toFixed(2);
    
    // 格式化稳定支出数据
    var formattedStableExpenses = {};
    for (var category in stableExpenseCategories) {
      if (stableExpenseCategories.hasOwnProperty(category)) {
        formattedStableExpenses[category] = parseFloat(stableExpenseCategories[category]).toFixed(2);
      }
    }
    
    return {
      predictedIncome: predictedIncome,
      predictedExpense: predictedExpense,
      predictedBalance: predictedBalance,
      stableExpenses: formattedStableExpenses
    };
  },

  // 生成下个月的建议
  generateNextMonthAdvice(prediction) {
    var advice = [];
    var predictedIncome = parseFloat(prediction.predictedIncome);
    var predictedExpense = parseFloat(prediction.predictedExpense);
    var predictedBalance = parseFloat(prediction.predictedBalance);
    
    // 根据预测结余给出建议
    if (predictedBalance < 0) {
      advice.push('下个月预测结余为负，建议控制支出，特别是购物和娱乐方面的非必要消费。');
    } else if (predictedBalance < predictedIncome * 0.1) {
      advice.push('下个月预测结余较少，建议适当减少购物支出，增加储蓄比例。');
    } else if (predictedBalance > predictedIncome * 0.3) {
      advice.push('下个月预测结余良好，可以考虑增加投资或储蓄，为长期财务目标做准备。');
    }
    
    // 根据各类支出占比给出建议
    var maxExpenseCategory = { category: '', amount: 0 };
    for (var category in prediction.stableExpenses) {
      if (prediction.stableExpenses.hasOwnProperty(category)) {
        var amount = prediction.stableExpenses[category];
        if (parseFloat(amount) > parseFloat(maxExpenseCategory.amount)) {
          maxExpenseCategory = { category: category, amount: amount };
        }
      }
    }
    
    if (maxExpenseCategory.category && parseFloat(maxExpenseCategory.amount) > predictedExpense * 0.4) {
      advice.push('您在' + maxExpenseCategory.category + '方面的支出占比较高（约' + (parseFloat(maxExpenseCategory.amount) / predictedExpense * 100).toFixed(0) + '%），建议适当控制。');
    }
    
    // 检查住房支出（如果有）
    if (prediction.stableExpenses['住房'] || prediction.stableExpenses['租房']) {
      const housingExpense = parseFloat(prediction.stableExpenses['住房'] || prediction.stableExpenses['租房']);
      if (housingExpense > predictedIncome * 0.3) {
        advice.push('住房支出占收入比例过高（超过30%），建议考虑调整居住方案或增加收入。');
      }
    }
    
    // 检查餐饮支出
    if (prediction.stableExpenses['餐饮']) {
      const diningExpense = parseFloat(prediction.stableExpenses['餐饮']);
      if (diningExpense > predictedExpense * 0.3) {
        advice.push('餐饮支出占比较高，建议适当减少外出就餐次数，增加自制餐食。');
      }
    }
    
    // 检查购物支出
    if (prediction.stableExpenses['购物']) {
      const shoppingExpense = parseFloat(prediction.stableExpenses['购物']);
      if (shoppingExpense > predictedExpense * 0.2) {
        advice.push('购物支出占比较高，建议制定购物计划，避免冲动消费。');
      }
    }
    
    // 如果没有具体建议，给出通用建议
    if (advice.length === 0) {
      advice.push('下个月收支预测较为平衡，建议继续保持良好的消费习惯，适当增加储蓄。');
    }
    
    return advice;
  },

  // 计算财务健康评分（科学评估体系）
  calculateHealthScore(stats, username) {
    let totalScore = 0;
    const assessmentDetails = {};

    // 确保stats有正确的默认值
    stats = stats || {
      income: 0,
      expense: 0,
      balance: 0
    };

    // 获取用户的交易记录
    const transactions = storage.getUserTransactions(username);
    console.log('Transactions:', transactions);

    // 1. 收支结构评估（30分）
    let incomeStructureScore = 0;
    
    // 1.1 储蓄率（15分）
    let savingsRate = 0;
    const safeIncome = parseFloat(stats.income) || 0;
    const safeExpense = parseFloat(stats.expense) || 0;
    
    if (safeIncome > 0) {
      savingsRate = parseFloat(((safeIncome - safeExpense) / safeIncome * 100).toFixed(1));
      const savingsRateNum = (safeIncome - safeExpense) / safeIncome;
      if (savingsRateNum >= 0.3) {
        incomeStructureScore += 15;
      } else if (savingsRateNum >= 0.2) {
        incomeStructureScore += 12;
      } else if (savingsRateNum >= 0.1) {
        incomeStructureScore += 8;
      } else if (savingsRateNum >= 0.05) {
        incomeStructureScore += 4;
      } else {
        incomeStructureScore += 0;
      }
    }
    
    // 1.2 收入稳定性（10分）
    const incomeStability = parseFloat((storage.calculateIncomeStability(username) * 100).toFixed(1));
    const incomeStabilityNum = storage.calculateIncomeStability(username) || 0;
    if (incomeStabilityNum < 0.1) {
      incomeStructureScore += 10;
    } else if (incomeStabilityNum < 0.2) {
      incomeStructureScore += 8;
    } else if (incomeStabilityNum < 0.3) {
      incomeStructureScore += 5;
    } else if (incomeStabilityNum < 0.5) {
      incomeStructureScore += 3;
    } else {
      incomeStructureScore += 0;
    }
    
    // 1.3 消费占比合理性（5分）
    let expenseRatio = 0;
    if (safeIncome > 0) {
      expenseRatio = parseFloat((safeExpense / safeIncome * 100).toFixed(1));
      const expenseRatioNum = safeExpense / safeIncome;
      if (expenseRatioNum < 0.5) {
        incomeStructureScore += 5;
      } else if (expenseRatioNum < 0.7) {
        incomeStructureScore += 4;
      } else if (expenseRatioNum < 0.9) {
        incomeStructureScore += 2;
      } else if (expenseRatioNum < 1) {
        incomeStructureScore += 1;
      } else {
        incomeStructureScore += 0;
      }
    }
    
    totalScore += incomeStructureScore;
    
    // 保存收支结构评分
    assessmentDetails.incomeStructureScore = incomeStructureScore;
    assessmentDetails.savingsRate = savingsRate;
    assessmentDetails.incomeStability = incomeStability;
    assessmentDetails.expenseRatio = expenseRatio;

    // 2. 资产负债状况（25分）
    let assetLiabilityScore = 0;
    
    // 2.1 净资产状况（10分）
    const totalAssetsNum = parseFloat(storage.getUserTotalAssets(username)) || 0;
    const totalAssets = parseFloat(totalAssetsNum.toFixed(2));
    const annualIncome = parseFloat(stats.income) * 12 || 0;
    let assetToIncomeRatio = 0;
    if (annualIncome > 0) {
      assetToIncomeRatio = parseFloat((totalAssetsNum / annualIncome).toFixed(2));
      const assetToIncomeRatioNum = totalAssetsNum / annualIncome;
      if (assetToIncomeRatioNum > 3) {
        assetLiabilityScore += 10;
      } else if (assetToIncomeRatioNum > 1) {
        assetLiabilityScore += 8;
      } else if (assetToIncomeRatioNum > 0.5) {
        assetLiabilityScore += 5;
      } else if (assetToIncomeRatioNum > 0) {
        assetLiabilityScore += 3;
      } else {
        assetLiabilityScore += 0;
      }
    } else {
      // 如果年度收入为0，使用月度收入计算
      const monthlyIncome = parseFloat(stats.income) || 0;
      if (monthlyIncome > 0) {
        assetToIncomeRatio = parseFloat((totalAssetsNum / monthlyIncome).toFixed(2));
        const assetToIncomeRatioNum = totalAssetsNum / monthlyIncome;
        if (assetToIncomeRatioNum > 36) {
          assetLiabilityScore += 10;
        } else if (assetToIncomeRatioNum > 12) {
          assetLiabilityScore += 8;
        } else if (assetToIncomeRatioNum > 6) {
          assetLiabilityScore += 5;
        } else if (assetToIncomeRatioNum > 0) {
          assetLiabilityScore += 3;
        } else {
          assetLiabilityScore += 0;
        }
      }
    }
    
    // 2.2 债务收入比（10分）
    const totalDebtNum = parseFloat(storage.getUserTotalDebt(username)) || 0;
    const totalDebt = parseFloat(totalDebtNum.toFixed(2));
    let debtToIncomeRatio = 0;
    if (annualIncome > 0) {
      debtToIncomeRatio = parseFloat((totalDebtNum / annualIncome * 100).toFixed(1));
      const debtToIncomeRatioNum = totalDebtNum / annualIncome;
      if (debtToIncomeRatioNum < 0.2) {
        assetLiabilityScore += 10;
      } else if (debtToIncomeRatioNum < 0.3) {
        assetLiabilityScore += 8;
      } else if (debtToIncomeRatioNum < 0.4) {
        assetLiabilityScore += 5;
      } else if (debtToIncomeRatioNum < 0.5) {
        assetLiabilityScore += 3;
      } else {
        assetLiabilityScore += 0;
      }
    }
    
    // 2.3 流动性比率（5分）
    const liquidityRatioNum = parseFloat(storage.calculateLiquidityRatio(username)) || 0;
    const liquidityRatio = parseFloat(liquidityRatioNum.toFixed(1));
    if (liquidityRatioNum >= 6) {
      assetLiabilityScore += 5;
    } else if (liquidityRatioNum >= 4) {
      assetLiabilityScore += 4;
    } else if (liquidityRatioNum >= 3) {
      assetLiabilityScore += 3;
    } else if (liquidityRatioNum >= 2) {
      assetLiabilityScore += 2;
    } else {
      assetLiabilityScore += 0;
    }
    
    totalScore += assetLiabilityScore;
    
    // 保存资产负债评分
    assessmentDetails.assetLiabilityScore = assetLiabilityScore;
    assessmentDetails.totalAssets = totalAssets;
    assessmentDetails.totalDebt = totalDebt;
    assessmentDetails.debtToIncomeRatio = debtToIncomeRatio;
    assessmentDetails.assetToIncomeRatio = assetToIncomeRatio;

    // 3. 财务安全保障（20分）
    let financialSecurityScore = 0;
    
    // 3.1 应急基金充足度（10分）
    const monthlyExpense = parseFloat(stats.expense) || 0;
    let emergencyFundMonths = 0;
    if (monthlyExpense > 0) {
      emergencyFundMonths = parseFloat((totalAssetsNum / monthlyExpense).toFixed(1));
      const emergencyFundMonthsNum = totalAssetsNum / monthlyExpense;
      if (emergencyFundMonthsNum >= 6) {
        financialSecurityScore += 10;
      } else if (emergencyFundMonthsNum >= 4) {
        financialSecurityScore += 8;
      } else if (emergencyFundMonthsNum >= 3) {
        financialSecurityScore += 6;
      } else if (emergencyFundMonthsNum >= 2) {
        financialSecurityScore += 3;
      } else {
        financialSecurityScore += 0;
      }
    } else {
      // 如果月度支出为0，使用月度收入的50%作为估计支出
      const estimatedExpense = parseFloat(stats.income) * 0.5 || 1;
      emergencyFundMonths = parseFloat((totalAssetsNum / estimatedExpense).toFixed(1));
      const emergencyFundMonthsNum = totalAssetsNum / estimatedExpense;
      if (emergencyFundMonthsNum >= 6) {
        financialSecurityScore += 10;
      } else if (emergencyFundMonthsNum >= 4) {
        financialSecurityScore += 8;
      } else if (emergencyFundMonthsNum >= 3) {
        financialSecurityScore += 6;
      } else if (emergencyFundMonthsNum >= 2) {
        financialSecurityScore += 3;
      } else {
        financialSecurityScore += 0;
      }
    }
    
    // 3.2 保险保障程度（10分）- 简化处理，实际需要用户输入
    financialSecurityScore += 5; // 默认基础分
    
    totalScore += financialSecurityScore;
    
    // 保存财务安全保障评分
    assessmentDetails.financialSecurityScore = financialSecurityScore;
    assessmentDetails.emergencyFundMonths = emergencyFundMonths;
    assessmentDetails.liquidityRatio = liquidityRatio;

    // 4. 消费行为分析（15分）
    let consumptionBehaviorScore = 0;
    
    // 4.1 消费多样性（7分）
    const expenseDiversity = Math.round(parseFloat(storage.calculateExpenseDiversity(username)) || 0);
    if (expenseDiversity >= 8) {
      consumptionBehaviorScore += 7;
    } else if (expenseDiversity >= 6) {
      consumptionBehaviorScore += 6;
    } else if (expenseDiversity >= 4) {
      consumptionBehaviorScore += 4;
    } else if (expenseDiversity >= 2) {
      consumptionBehaviorScore += 2;
    } else {
      consumptionBehaviorScore += 0;
    }
    
    // 4.2 冲动消费控制（8分）- 简化处理，实际需要用户输入
    consumptionBehaviorScore += 4; // 默认基础分
    
    totalScore += consumptionBehaviorScore;
    
    // 保存消费行为评分
    assessmentDetails.consumptionBehaviorScore = consumptionBehaviorScore;
    assessmentDetails.expenseDiversity = expenseDiversity;

    // 5. 长期财务规划（10分）
    let longTermPlanningScore = 0;
    
    // 5.1 投资比例（5分）- 简化处理
    if (totalAssetsNum > 0) {
      // 假设部分资产为投资资产
      longTermPlanningScore += 2;
    }
    
    // 5.2 退休储备（5分）- 简化处理
    longTermPlanningScore += 2;
    
    totalScore += longTermPlanningScore;
    
    // 保存长期财务规划评分
    assessmentDetails.longTermPlanningScore = longTermPlanningScore;

    // 确保分数在0-100之间
    totalScore = Math.max(0, Math.min(100, totalScore));
    
    return {
      totalScore: Math.round(totalScore),
      assessmentDetails: assessmentDetails
    };
  },

  // 获取健康等级
  getHealthLevel(score) {
    if (score >= 90) {
      return '优秀';
    } else if (score >= 80) {
      return '良好';
    } else if (score >= 70) {
      return '中等';
    } else if (score >= 60) {
      return '一般';
    } else {
      return '较差';
    }
  },

  // 生成AI建议
  generateAIAdvice(stats, healthScore) {
    const advice = [];
    const { userInfo } = app.globalData;
    const safeIncome = parseFloat(stats.income) || 0;
    const safeExpense = parseFloat(stats.expense) || 0;
    
    // 1. 收支结构分析
    if (safeIncome > 0) {
      const savingsRate = (safeIncome - safeExpense) / safeIncome;
      if (savingsRate < 0.05) {
        advice.push('储蓄率过低，建议立即制定预算计划，将储蓄率提高到至少5%');
      } else if (savingsRate < 0.1) {
        advice.push('储蓄率尚可，建议逐步提高到10%以上以增强财务稳定性');
      } else if (savingsRate < 0.2) {
        advice.push('储蓄率良好，建议继续保持并尝试提高到20%以加速财富积累');
      } else {
        advice.push('储蓄习惯优秀！建议将部分储蓄用于多元化投资以实现财富增值');
      }
    }

    // 2. 资产负债状况分析
    const totalAssets = storage.getUserTotalAssets(userInfo.username);
    const totalDebt = storage.getUserTotalDebt(userInfo.username);
    const annualIncome = stats.income * 12;
    
    if (annualIncome > 0) {
      const debtToIncomeRatio = totalDebt / annualIncome;
      if (debtToIncomeRatio > 0.5) {
        advice.push('债务负担较重，建议优先偿还高息债务，降低债务收入比');
      } else if (debtToIncomeRatio > 0.3) {
        advice.push('债务比例适中，建议控制新增债务，逐步降低负债率');
      }
    }
    
    // 3. 财务安全保障分析
    const liquidityRatio = parseFloat(storage.calculateLiquidityRatio(userInfo?.username)) || 0;
    if (liquidityRatio < 3) {
      advice.push('应急基金不足，建议建立至少能覆盖3-6个月支出的备用金');
    } else {
      advice.push('应急基金储备充足，为您的财务安全提供了良好保障');
    }

    // 4. 消费行为分析
    const expenseDiversity = parseFloat(storage.calculateExpenseDiversity(userInfo?.username)) || 0;
    if (expenseDiversity < 4) {
      advice.push('消费结构较为集中，建议合理分配各项支出，避免过度依赖单一消费类别');
    } else {
      advice.push('消费结构较为均衡，继续保持理性消费习惯');
    }

    // 5. 长期财务规划
    const longTermTotalAssets = parseFloat(storage.getUserTotalAssets(userInfo?.username)) || 0;
    if (longTermTotalAssets > 0 && healthScore > 70) {
      advice.push('建议考虑长期投资规划，如基金、保险等，实现财富的持续增长');
    }

    // 6. 综合建议
    if (healthScore >= 90) {
      advice.push('🌟 您的财务状况非常优秀！继续保持当前的理财策略，同时可以考虑更高级的财富管理方案');
    } else if (healthScore >= 80) {
      advice.push('✨ 您的财务状况良好！保持现有习惯，适当优化投资策略可进一步提升');
    } else if (healthScore >= 70) {
      advice.push('📈 您的财务状况中等，有一定改进空间，重点关注储蓄和投资规划');
    } else if (healthScore >= 60) {
      advice.push('⚠️ 您的财务状况一般，需要加强预算管理和储蓄习惯');
    } else {
      advice.push('🚩 建议立即制定详细的财务规划，控制支出，增加收入，逐步改善财务状况');
    }

    return advice;
  },

  // 准备图表数据
  prepareChartData(username, year, month) {
    var chartData = {
      categoryData: [],
      trendData: []
    };

    // 分类数据
    var stats = storage.getMonthlyStatistics(username, year, month);
    var categoryExpenses = stats.categoryExpenses;
    var categories = Object.keys(categoryExpenses);
    for (var i = 0; i < categories.length; i++) {
      var category = categories[i];
      // 防止除以0错误
      var percentage = stats.expense > 0 ? Math.round((categoryExpenses[category] / stats.expense) * 100) : 0;
      chartData.categoryData.push({
        name: category,
        value: categoryExpenses[category],
        percentage: percentage
      });
    }

    // 趋势数据（过去6个月）
    for (let i = 5; i >= 0; i--) {
      const targetMonth = month - i;
      const targetYear = targetMonth <= 0 ? year - 1 : year;
      const adjustedMonth = targetMonth <= 0 ? 12 + targetMonth : targetMonth;
      
      const monthlyStats = storage.getMonthlyStatistics(username, targetYear, adjustedMonth);
      chartData.trendData.push({
        month: `${adjustedMonth}月`,
        income: parseFloat(monthlyStats.income) || 0,
        expense: parseFloat(monthlyStats.expense) || 0
      });
    }

    return chartData;
  },

  // 绘制分类饼图
  drawCategoryChart() {
    const ctx = wx.createCanvasContext('categoryChart');
    const { categoryData } = this.data.chartData;
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    
    var startAngle = 0;
    var colors = ['#3498db', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
    
    for (var i = 0; i < categoryData.length; i++) {
      var item = categoryData[i];
      var index = i;
      var angle = (item.percentage / 100) * 2 * Math.PI;
      
      // 绘制扇形
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
      ctx.closePath();
      ctx.setFillStyle(colors[index % colors.length]);
      ctx.fill();
      
      // 绘制标签
      var labelRadius = radius + 30;
      var labelAngle = startAngle + angle / 2;
      var labelX = centerX + Math.cos(labelAngle) * labelRadius;
      var labelY = centerY + Math.sin(labelAngle) * labelRadius;
      
      ctx.setFontSize(16);
      ctx.setFillStyle('#333');
      ctx.setTextAlign(labelX > centerX ? 'left' : 'right');
      ctx.fillText(item.name + ' ' + item.percentage + '%', labelX, labelY);
      
      startAngle += angle;
    }
    
    // 绘制中心圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
    ctx.setFillStyle('#fff');
    ctx.fill();
    
    // 绘制中心文字
    ctx.setFontSize(20);
    ctx.setFillStyle('#3498db');
    ctx.setTextAlign('center');
    ctx.fillText('消费', centerX, centerY - 10);
    ctx.setFontSize(16);
    ctx.fillText('占比', centerX, centerY + 15);
    
    ctx.draw();
  },

  // 绘制趋势折线图
  drawTrendChart() {
    const ctx = wx.createCanvasContext('trendChart');
    const { trendData } = this.data.chartData;
    const width = 300;
    const height = 200;
    const padding = 40;
    
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // 绘制背景
    ctx.setFillStyle('#fff');
    ctx.fillRect(0, 0, width, height);
    
    // 绘制坐标轴
    ctx.setStrokeStyle('#ccc');
    ctx.setLineWidth(2);
    // X轴
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    // Y轴
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // 计算最大值
    var maxValue = 0;
    for (var i = 0; i < trendData.length; i++) {
      var item = trendData[i];
      maxValue = Math.max(maxValue, item.income, item.expense);
    }
    maxValue = Math.ceil(maxValue / 1000) * 1000; // 向上取整到千位
    
    // 绘制Y轴刻度
    ctx.setFontSize(12);
    ctx.setFillStyle('#666');
    for (let i = 0; i <= 5; i++) {
      const value = maxValue * i / 5;
      const y = height - padding - (chartHeight * i / 5);
      
      // 刻度线
      ctx.beginPath();
      ctx.moveTo(padding - 5, y);
      ctx.lineTo(padding, y);
      ctx.stroke();
      
      // 刻度值
      ctx.setTextAlign('right');
      ctx.fillText(value.toLocaleString(), padding - 10, y + 5);
    }
    
    // 绘制X轴刻度
    for (var i = 0; i < trendData.length; i++) {
      var item = trendData[i];
      var index = i;
      var x = padding + (chartWidth * (index + 0.5) / trendData.length);
      
      // 刻度线
      ctx.beginPath();
      ctx.moveTo(x, height - padding);
      ctx.lineTo(x, height - padding + 5);
      ctx.stroke();
      
      // 刻度值
      ctx.setTextAlign('center');
      ctx.fillText(item.month, x, height - padding + 20);
    }
    
    // 绘制收入折线
    ctx.setStrokeStyle('#27ae60');
    ctx.setLineWidth(3);
    ctx.beginPath();
    for (var i = 0; i < trendData.length; i++) {
      var item = trendData[i];
      var index = i;
      var x = padding + (chartWidth * (index + 0.5) / trendData.length);
      var y = height - padding - (chartHeight * item.income / maxValue);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // 绘制收入数据点
    for (var i = 0; i < trendData.length; i++) {
      var item = trendData[i];
      var index = i;
      var x = padding + (chartWidth * (index + 0.5) / trendData.length);
      var y = height - padding - (chartHeight * item.income / maxValue);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.setFillStyle('#27ae60');
      ctx.fill();
    }
    
    // 绘制支出折线
    ctx.setStrokeStyle('#e74c3c');
    ctx.setLineWidth(3);
    ctx.beginPath();
    for (var i = 0; i < trendData.length; i++) {
      var item = trendData[i];
      var index = i;
      var x = padding + (chartWidth * (index + 0.5) / trendData.length);
      var y = height - padding - (chartHeight * item.expense / maxValue);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // 绘制支出数据点
    for (var i = 0; i < trendData.length; i++) {
      var item = trendData[i];
      var index = i;
      var x = padding + (chartWidth * (index + 0.5) / trendData.length);
      var y = height - padding - (chartHeight * item.expense / maxValue);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.setFillStyle('#e74c3c');
      ctx.fill();
    }
    
    // 绘制图例
    ctx.setFontSize(14);
    // 收入图例
    ctx.setFillStyle('#27ae60');
    ctx.fillRect(padding, padding - 30, 15, 15);
    ctx.setFillStyle('#333');
    ctx.setTextAlign('left');
    ctx.fillText('收入', padding + 25, padding - 18);
    // 支出图例
    ctx.setFillStyle('#e74c3c');
    ctx.fillRect(width - padding - 80, padding - 30, 15, 15);
    ctx.setFillStyle('#333');
    ctx.fillText('支出', width - padding - 60, padding - 18);
    
    ctx.draw();
  }
})