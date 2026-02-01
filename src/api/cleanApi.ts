// API جديد ونظيف - يستخدم البيانات من الورك شيت مباشرة
import WorksheetDataService from '../services/WorksheetDataService';

const worksheetService = WorksheetDataService.getInstance();

export const cleanApi = {
  // تسجيل الدخول
  async login(fullName: string, phoneNumber: string) {
    console.log('🔐 Clean API: Login attempt for:', fullName);
    
    const user = worksheetService.validateLogin(fullName, phoneNumber);
    
    if (!user) {
      throw new Error('بيانات تسجيل الدخول غير صحيحة');
    }

    // حفظ بيانات المستخدم
    const token = 'worksheet-token-' + user.subscriberNumber;
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', token);

    console.log('✅ Clean API: Login successful for:', user.fullName);
    
    return {
      token,
      user
    };
  },

  // الحصول على بيانات المستخدم
  async getUserData(token: string) {
    console.log('👤 Clean API: Getting user data...');
    
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      console.log('✅ Clean API: User data loaded from localStorage');
      return userData;
    }

    throw new Error('لم يتم العثور على بيانات المستخدم');
  },

  // الحصول على بيانات المحفظة
  async getPortfolio() {
    console.log('📊 Clean API: Getting portfolio data from worksheet...');
    
    const portfolio = worksheetService.getPortfolio();
    const lastUpdate = worksheetService.getLastUpdateTime();
    
    console.log('✅ Clean API: Portfolio loaded - 8 companies, total:', portfolio.totalPortfolioValue);
    console.log('🕒 Last update:', lastUpdate?.toLocaleString('ar-SA') || 'Never');
    
    return {
      items: portfolio.items.map(item => ({
        companyName: item.companyName,
        assetSymbol: item.assetSymbol,
        units: item.units,
        marketPrice: item.marketPrice,
        totalValueUSD: item.marketValueUSD,
        totalValueSAR: item.totalValueSAR,
        growth: item.growth
      })),
      totalPortfolioValue: portfolio.totalPortfolioValue
    };
  },

  // الحصول على جميع المشتركين (للإدمن)
  async getAllSubscribers() {
    console.log('👥 Clean API: Getting all subscribers from worksheet...');
    
    const subscribers = worksheetService.getAllSubscribers();
    
    console.log('✅ Clean API: Loaded', subscribers.length, 'subscribers');
    
    return subscribers.map(sub => ({
      subscriberNumber: sub.subscriberNumber,
      fullName: sub.fullName,
      phoneNumber: sub.phoneNumber,
      sharesCount: sub.sharesCount,
      totalSavings: sub.totalSavings,
      monthlyPayment: sub.monthlyPayment,
      baseShareValue: sub.baseShareValue,
      currentShareValue: sub.currentShareValue,
      realPortfolioValue: sub.realPortfolioValue,
      ownershipPercentage: sub.ownershipPercentage,
      growthPercentage: sub.growthPercentage,
      totalIncome: sub.realPortfolioValue
    }));
  },

  // الحصول على معلومات آخر تحديث
  getLastUpdateInfo() {
    const lastUpdate = worksheetService.getLastUpdateTime();
    return {
      lastUpdate: lastUpdate?.toISOString() || null,
      lastUpdateFormatted: lastUpdate?.toLocaleString('ar-SA') || 'لم يتم التحديث بعد',
      nextUpdate: lastUpdate ? new Date(lastUpdate.getTime() + 60 * 60 * 1000).toLocaleString('ar-SA') : 'غير محدد'
    };
  }
};

export default cleanApi;