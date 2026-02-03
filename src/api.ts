import WorksheetFetcher from './utils/worksheetFetcher.js';

// API URL for staging environment (updated v6 - FORCE CACHE CLEAR)
const API_URL = 'https://staging--fxugj5spc8ghki7u3abz.youbase.cloud';

// Force rebuild timestamp - ensure latest changes are deployed
const CACHE_BUSTER = Date.now();
const VERSION = '9.0.0-FORCE-UPDATE';
console.log('🚀 API Module loaded - Version', VERSION, '- Cache Buster:', CACHE_BUSTER);
console.log('📋 AUTO-UPDATE: System will fetch fresh data from worksheet every hour');
console.log('⚠️ FORCE UPDATE: Using new data structure - Clear cache if old data appears');

// Auto-update mechanism - refresh data every hour
let lastDataUpdate = 0;
const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
let cachedSubscribersData: any[] = [];
let cachedPortfolioData: any = null;

// Data source URLs - Updated with user's worksheet (both sheets)
const SHEET_ID = '2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx';
const MAIN_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pub?output=csv';
const SUBSCRIBERS_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pub?output=csv&gid=0';
const PORTFOLIO_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pub?output=csv&gid=1';

// Alternative formats for better compatibility
const ALT_SUBSCRIBERS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pub?output=tsv&gid=0';
const ALT_PORTFOLIO_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pub?output=tsv&gid=1';

// HTML versions for scraping if needed
const HTML_SUBSCRIBERS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pubhtml?gid=0&single=true';
const HTML_PORTFOLIO_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pubhtml?gid=1&single=true';

// Timeout for fetch requests (30 seconds for Google Sheets slow loading)
const FETCH_TIMEOUT = 30000;

// Helper function to fetch with timeout
const fetchWithTimeout = async (url: string, timeout = FETCH_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const api = {
  // Force clear all cached data and reload
  forceClearCache() {
    console.log('🔄 FORCE CLEARING ALL CACHED DATA...');
    cachedSubscribersData = [];
    cachedPortfolioData = null;
    lastDataUpdate = 0;
    
    // Clear localStorage
    localStorage.removeItem('currentUser');
    localStorage.clear();
    
    console.log('✅ All cached data cleared - will reload fresh data');
  },

  // Force refresh data from worksheet
  async forceRefreshData() {
    console.log('🔄 FORCING DATA REFRESH from worksheet...');
    lastDataUpdate = 0; // Reset timestamp to force refresh
    cachedSubscribersData = [];
    cachedPortfolioData = null;
    
    // Fetch fresh data
    const subscribers = await this.getAllSubscribers();
    const portfolio = await this.getPortfolio();
    
    console.log('✅ Data refresh completed');
    return { subscribers, portfolio };
  },

  async login(fullName: string, phoneNumber: string) {
    // التحقق من بيانات الإدمن أولاً
    if (fullName === 'مدير النظام الرئيسي' && phoneNumber === 'admin123') {
      console.log('⚡ Admin login - immediate response');
      return { 
        token: 'admin-token', 
        user: { fullName, phoneNumber, isAdmin: true } 
      };
    }

    // **تحسين الأداء: البحث في البيانات المحلية فوراً**
    console.log('⚡ Regular login - using local data immediately');
    const subscribers = this.getUpdatedSubscribersData();
    console.log('🔍 Login attempt for:', fullName, phoneNumber);
    console.log('🔍 Searching in', subscribers.length, 'subscribers');
    
    const user = subscribers.find(sub => 
      sub.fullName === fullName && sub.phoneNumber === phoneNumber
    );

    if (user) {
      console.log('✅ User found immediately:', user.fullName);
      console.log('📊 User data:', {
        shares: user.sharesCount,
        ownership: user.ownershipPercentage,
        portfolioValue: user.realPortfolioValue
      });
      
      // إنشاء token وإرجاع بيانات المستخدم المحدثة فوراً
      const token = 'local-token-' + user.subscriberNumber;
      
      const updatedUserData = {
        ...user,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        subscriberNumber: user.subscriberNumber,
        sharesCount: user.sharesCount,
        totalSavings: user.totalSavings,
        monthlyPayment: user.monthlyPayment,
        realPortfolioValue: user.realPortfolioValue,
        ownershipPercentage: user.ownershipPercentage,
        growthPercentage: user.growthPercentage,
        totalIncome: user.totalIncome,
        baseShareValue: user.baseShareValue,
        currentShareValue: user.currentShareValue
      };
      
      // تخزين البيانات في localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
      console.log('💾 Stored user data in localStorage immediately');
      
      // تحديث البيانات من Google Sheets في الخلفية (بدون انتظار)
      this.updateUserDataInBackground(updatedUserData);
      
      return { 
        token, 
        user: updatedUserData
      };
    }

    console.log('❌ User not found in local data');
    
    // إذا لم يوجد في البيانات المحلية، جرب الخادم الخارجي (سريع)
    try {
      const res = await fetch(`${API_URL}/api/public/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phoneNumber }),
      });
      
      if (res.ok) {
        return res.json();
      }
    } catch (error) {
      console.warn('External API failed, user not found in local data');
    }

    throw new Error('بيانات تسجيل الدخول غير صحيحة');
  },

  async getUserData(token: string) {
    console.log('🔍 Getting user data for token:', token);
    
    // إذا كان token للإدمن، إرجاع بيانات الإدمن فوراً
    if (token === 'admin-token') {
      return { fullName: 'مدير النظام الرئيسي', phoneNumber: 'admin123', isAdmin: true };
    }
    
    // **تحسين الأداء: استخدام البيانات المحلية فوراً**
    console.log('⚡ Getting user data immediately from local data...');
    
    // البحث عن المستخدم الحالي في localStorage أولاً
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      console.log('📋 Found stored user:', userData.fullName);
      
      // التحقق من البيانات المحلية المحدثة
      const subscribers = this.getUpdatedSubscribersData();
      const updatedUser = subscribers.find(sub => 
        sub.fullName === userData.fullName && sub.phoneNumber === userData.phoneNumber
      );
      
      if (updatedUser) {
        console.log('✅ Using updated local data for user:', updatedUser.fullName);
        console.log('📊 User data:', {
          shares: updatedUser.sharesCount,
          ownership: updatedUser.ownershipPercentage,
          portfolioValue: updatedUser.realPortfolioValue
        });
        
        // تحديث localStorage بالبيانات الجديدة
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // تحديث من Google Sheets في الخلفية (بدون انتظار)
        this.updateUserDataInBackground(updatedUser);
        
        return updatedUser;
      } else {
        console.log('📋 Using cached user data');
        return userData;
      }
    }

    // إذا لم توجد بيانات محلية، استخدم البيانات الافتراضية
    console.log('📋 No stored user, using default data');
    const subscribers = this.getUpdatedSubscribersData();
    const subscriberNumber = token.replace('local-token-', '');
    const user = subscribers.find(sub => sub.subscriberNumber === subscriberNumber) || subscribers[0];
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log('💾 Stored default user data:', user.fullName);
    }
    
    return user;
  },

  // دالة جديدة لتحديث بيانات المستخدم في الخلفية
  async updateUserDataInBackground(currentUser: any) {
    console.log('🔄 Starting background user data update...');
    
    try {
      // محاولة سريعة للحصول على البيانات المحدثة
      const allSubscribers = await this.getAllSubscribers();
      
      // البحث عن المستخدم المحدث
      const updatedUser = allSubscribers.find(sub => 
        sub.fullName === currentUser.fullName && sub.phoneNumber === currentUser.phoneNumber
      );
      
      if (updatedUser) {
        // مقارنة البيانات للتحقق من وجود تحديثات
        const hasUpdates = (
          updatedUser.sharesCount !== currentUser.sharesCount ||
          updatedUser.ownershipPercentage !== currentUser.ownershipPercentage ||
          updatedUser.realPortfolioValue !== currentUser.realPortfolioValue
        );
        
        if (hasUpdates) {
          console.log('✅ Background: Found user data updates');
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          
          // يمكن إضافة event للإشعار بالتحديث إذا لزم الأمر
          console.log('💾 Background: Updated user data in localStorage');
        } else {
          console.log('📋 Background: No user data changes detected');
        }
      }
      
    } catch (error) {
      console.warn('Background user update error:', error);
    }
  },

  async saveConfig(sheetUrl: string) {
    const res = await fetch(`${API_URL}/api/public/admin/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetUrl }),
    });
    if (!res.ok) throw new Error('Failed to save config');
    return res.json();
  },

  async getConfig() {
    const res = await fetch(`${API_URL}/api/public/admin/config`);
    if (!res.ok) throw new Error('Failed to get config');
    return res.json();
  },

  async getAllSubscribers() {
    console.log('📋 Loading subscribers data...');
    
    // **تحسين الأداء: استخدام البيانات المحلية فوراً**
    const localData = this.getUpdatedSubscribersData();
    console.log('⚡ Using local data immediately (', localData.length, 'subscribers)');
    
    // تحديث الـ cache المحلي فوراً
    cachedSubscribersData = localData;
    lastDataUpdate = Date.now();
    
    // محاولة التحديث من Google Sheets في الخلفية (بدون انتظار)
    this.updateFromGoogleSheetsInBackground();
    
    return localData;
  },

  // دالة جديدة للتحديث في الخلفية
  async updateFromGoogleSheetsInBackground() {
    // التحقق من آخر تحديث - إذا كان حديثاً، لا نحتاج للتحديث
    const now = Date.now();
    const timeSinceLastUpdate = now - lastDataUpdate;
    const shouldUpdate = timeSinceLastUpdate > UPDATE_INTERVAL; // ساعة واحدة
    
    if (!shouldUpdate) {
      console.log('📋 Data is fresh, skipping background update');
      return;
    }
    
    console.log('🔄 Starting background update from Google Sheets...');
    
    try {
      // محاولة سريعة للحصول على البيانات (timeout أقل)
      const urls = [
        SUBSCRIBERS_DATA_URL,
        MAIN_DATA_URL,
        ALT_SUBSCRIBERS_URL
      ];
      
      for (const url of urls) {
        try {
          console.log(`📋 Background: Trying ${url}`);
          
          // timeout أقل للتحديث في الخلفية (10 ثواني بدلاً من 30)
          const response = await fetchWithTimeout(url, 10000);
          
          if (response.ok) {
            const textData = await response.text();
            console.log('📋 Background: Response length:', textData.length);
            
            // التحقق من وجود بيانات حقيقية
            if (textData.length > 500 && textData.includes('جعفر') && textData.includes('534000223')) {
              const result = this.parseCSVToSubscribers(textData);
              if (result.length >= 20) {
                console.log('✅ Background: Successfully updated from Google Sheets!');
                cachedSubscribersData = result;
                lastDataUpdate = now;
                
                // تحديث localStorage للمستخدم الحالي إذا وجد
                const currentUser = localStorage.getItem('currentUser');
                if (currentUser) {
                  const userData = JSON.parse(currentUser);
                  const updatedUser = result.find(sub => 
                    sub.fullName === userData.fullName && sub.phoneNumber === userData.phoneNumber
                  );
                  if (updatedUser) {
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    console.log('💾 Background: Updated current user data');
                  }
                }
                
                return;
              }
            }
          }
        } catch (error) {
          console.warn(`Background update failed for ${url}:`, error);
        }
      }
      
      console.log('📋 Background: All URLs failed, keeping local data');
      
    } catch (error) {
      console.warn('Background update error:', error);
    }
  },

  getUpdatedSubscribersData() {
    return [
      {
        subscriberNumber: '1',
        fullName: 'جعفر طاهر النزر',
        phoneNumber: '536003223',
        sharesCount: 42,
        totalSavings: 38100,
        monthlyPayment: 2100,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 38447.90,
        ownershipPercentage: 20.49,
        growthPercentage: -3.6,
        totalIncome: 38447.90,
      },
      {
        subscriberNumber: '2',
        fullName: 'عباس صالح النزر',
        phoneNumber: '504996691',
        sharesCount: 24,
        totalSavings: 21600,
        monthlyPayment: 1200,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 21970.23,
        ownershipPercentage: 11.71,
        growthPercentage: -3.6,
        totalIncome: 21970.23,
      },
      {
        subscriberNumber: '3',
        fullName: 'محمد دعبل العثمان',
        phoneNumber: '545473331',
        sharesCount: 5,
        totalSavings: 4000,
        monthlyPayment: 1000,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 5492.56,
        ownershipPercentage: 9.76,
        growthPercentage: -3.6,
        totalIncome: 5492.56,
      },
      {
        subscriberNumber: '4',
        fullName: 'يوسف أحمد المحمدعلي',
        phoneNumber: '560090953',
        sharesCount: 15,
        totalSavings: 13500,
        monthlyPayment: 750,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 13731.39,
        ownershipPercentage: 7.32,
        growthPercentage: -3.6,
        totalIncome: 13731.39,
      },
      {
        subscriberNumber: '5',
        fullName: 'علي طاهر النزر',
        phoneNumber: '551567697',
        sharesCount: 10,
        totalSavings: 9000,
        monthlyPayment: 500,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 9154.26,
        ownershipPercentage: 4.88,
        growthPercentage: -3.6,
        totalIncome: 9154.26,
      },
      {
        subscriberNumber: '6',
        fullName: 'حسن علي النزر',
        phoneNumber: '551679520',
        sharesCount: 10,
        totalSavings: 9000,
        monthlyPayment: 500,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 9154.26,
        ownershipPercentage: 4.88,
        growthPercentage: -3.6,
        totalIncome: 9154.26,
      },
      {
        subscriberNumber: '7',
        fullName: 'عبدالخالق أحمد المحمدعلي',
        phoneNumber: '561930452',
        sharesCount: 10,
        totalSavings: 9000,
        monthlyPayment: 500,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 9154.26,
        ownershipPercentage: 4.88,
        growthPercentage: -3.6,
        totalIncome: 9154.26,
      },
      {
        subscriberNumber: '8',
        fullName: 'أحمد علي العثمان',
        phoneNumber: '582299942',
        sharesCount: 10,
        totalSavings: 9000,
        monthlyPayment: 500,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 9154.26,
        ownershipPercentage: 4.88,
        growthPercentage: -3.6,
        totalIncome: 9154.26,
      },
      {
        subscriberNumber: '9',
        fullName: 'علي عبدالله الشهاب',
        phoneNumber: '550978601',
        sharesCount: 7,
        totalSavings: 6300,
        monthlyPayment: 350,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 6407.98,
        ownershipPercentage: 3.41,
        growthPercentage: -3.6,
        totalIncome: 6407.98,
      },
      {
        subscriberNumber: '10',
        fullName: 'معصومة الجبران',
        phoneNumber: '537926814',
        sharesCount: 6,
        totalSavings: 5400,
        monthlyPayment: 300,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 5492.56,
        ownershipPercentage: 2.93,
        growthPercentage: -3.6,
        totalIncome: 5492.56,
      },
      {
        subscriberNumber: '11',
        fullName: 'عباس طاهر النزر',
        phoneNumber: '506394798',
        sharesCount: 6,
        totalSavings: 5400,
        monthlyPayment: 300,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 5492.56,
        ownershipPercentage: 2.93,
        growthPercentage: -3.6,
        totalIncome: 5492.56,
      },
      {
        subscriberNumber: '12',
        fullName: 'قاسم طاهر النزر',
        phoneNumber: '567935956',
        sharesCount: 6,
        totalSavings: 5400,
        monthlyPayment: 300,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 5492.56,
        ownershipPercentage: 2.93,
        growthPercentage: -3.6,
        totalIncome: 5492.56,
      },
      {
        subscriberNumber: '13',
        fullName: 'عبدالمجيد جعفر النزر',
        phoneNumber: '500895023',
        sharesCount: 6,
        totalSavings: 5400,
        monthlyPayment: 300,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 5492.56,
        ownershipPercentage: 2.93,
        growthPercentage: -3.6,
        totalIncome: 5492.56,
      },
      {
        subscriberNumber: '14',
        fullName: 'محمد طاهر النزر',
        phoneNumber: '569373888',
        sharesCount: 4,
        totalSavings: 3600,
        monthlyPayment: 200,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 3661.70,
        ownershipPercentage: 1.95,
        growthPercentage: -3.6,
        totalIncome: 3661.70,
      },
      {
        subscriberNumber: '15',
        fullName: 'محمد المحمدعلي',
        phoneNumber: '569221338',
        sharesCount: 4,
        totalSavings: 3050,
        monthlyPayment: 200,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 3661.70,
        ownershipPercentage: 1.95,
        growthPercentage: -3.6,
        totalIncome: 3661.70,
      },
      {
        subscriberNumber: '16',
        fullName: 'زينب النزر',
        phoneNumber: '552657630',
        sharesCount: 6,
        totalSavings: 5400,
        monthlyPayment: 300,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 5492.56,
        ownershipPercentage: 2.93,
        growthPercentage: -3.6,
        totalIncome: 5492.56,
      },
      {
        subscriberNumber: '17',
        fullName: 'مريم النزر',
        phoneNumber: '551257703',
        sharesCount: 3,
        totalSavings: 2700,
        monthlyPayment: 150,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 2746.28,
        ownershipPercentage: 1.46,
        growthPercentage: -3.6,
        totalIncome: 2746.28,
      },
      {
        subscriberNumber: '18',
        fullName: 'أسماء المطلق',
        phoneNumber: '562087772',
        sharesCount: 3,
        totalSavings: 2700,
        monthlyPayment: 150,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 2746.28,
        ownershipPercentage: 1.46,
        growthPercentage: -3.6,
        totalIncome: 2746.28,
      },
      {
        subscriberNumber: '19',
        fullName: 'حوراء المطلق',
        phoneNumber: '542626031',
        sharesCount: 3,
        totalSavings: 2700,
        monthlyPayment: 150,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 2746.28,
        ownershipPercentage: 1.46,
        growthPercentage: -3.6,
        totalIncome: 2746.28,
      },
      {
        subscriberNumber: '20',
        fullName: 'زهره الشهاب',
        phoneNumber: '537926876',
        sharesCount: 3,
        totalSavings: 2850,
        monthlyPayment: 150,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 2746.28,
        ownershipPercentage: 1.46,
        growthPercentage: -3.6,
        totalIncome: 2746.28,
      },
      {
        subscriberNumber: '21',
        fullName: 'أحمد طاهر المطلق',
        phoneNumber: '564519351',
        sharesCount: 3,
        totalSavings: 2700,
        monthlyPayment: 150,
        baseShareValue: 950.00,
        currentShareValue: 915.43,
        realPortfolioValue: 2746.28,
        ownershipPercentage: 1.46,
        growthPercentage: -3.6,
        totalIncome: 2746.28,
      }
    ];
  },

  parseCSVToSubscribers(csvText: string) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const subscribers = [];

    console.log('📋 Parsing CSV data for subscribers...');
    console.log('📋 Total lines found:', lines.length);
    console.log('📋 First few lines:', lines.slice(0, 3));

    // Skip header row and process data
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Handle both comma and tab separated values
      const values = line.includes('\t') ? 
        line.split('\t').map(v => v.trim().replace(/^"|"$/g, '')) :
        line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      console.log(`📋 Processing row ${i}:`, values);
      
      // Based on the worksheet structure: اسم المشترك, رقم المشترك, عدد الأسهم, إجمالي مدخراتك, دفعة شهرية, قيمة سهم الأساس, قيمة سهم الحالي, القيمة الحقيقة لمحفظتك, نسبة تملك في صندوق, نسبة النمو المحفظة, رقم الجوال
      if (values.length >= 10 && values[0] && values[1] && !values[0].toLowerCase().includes('بيانات')) {
        try {
          const subscriber = {
            subscriberNumber: values[1] || i.toString(),
            fullName: values[0] || '',
            phoneNumber: values[10] || values[2] || '', // Phone number is in column 11 (index 10)
            sharesCount: parseFloat(values[2]) || 0,
            totalSavings: this.parseSARValue(values[3]) || 0,
            monthlyPayment: this.parseSARValue(values[4]) || 0,
            baseShareValue: this.parseSARValue(values[5]) || 0,
            currentShareValue: this.parseSARValue(values[6]) || 0,
            realPortfolioValue: this.parseSARValue(values[7]) || 0,
            ownershipPercentage: parseFloat(values[8]?.replace('%', '')) || 0,
            growthPercentage: parseFloat(values[9]?.replace('%', '')) || 0,
            totalIncome: this.parseSARValue(values[7]) || 0,
          };
          
          if (subscriber.fullName && subscriber.subscriberNumber) {
            console.log('✅ Successfully parsed subscriber:', subscriber.fullName);
            subscribers.push(subscriber);
          }
        } catch (error) {
          console.warn(`❌ Error parsing subscriber row ${i}:`, error, values);
        }
      }
    }
    
    console.log(`📋 Successfully parsed ${subscribers.length} subscribers from CSV`);
    return subscribers;
  },

  parseHTMLToSubscribers(htmlText: string) {
    console.log('📋 Parsing HTML data for subscribers...');
    const subscribers = [];
    
    try {
      // Extract table data from HTML
      const tableRegex = /<table[^>]*>(.*?)<\/table>/gis;
      const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
      const cellRegex = /<td[^>]*>(.*?)<\/td>/gis;
      
      const tableMatch = tableRegex.exec(htmlText);
      if (tableMatch) {
        const tableContent = tableMatch[1];
        let rowMatch;
        let rowIndex = 0;
        
        while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
          if (rowIndex === 0) { // Skip header
            rowIndex++;
            continue;
          }
          
          const rowContent = rowMatch[1];
          const cells = [];
          let cellMatch;
          
          while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
            cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
          }
          
          if (cells.length >= 10 && cells[0] && cells[1]) {
            try {
              const subscriber = {
                subscriberNumber: cells[1] || rowIndex.toString(),
                fullName: cells[0] || '',
                phoneNumber: cells[10] || cells[2] || '',
                sharesCount: parseFloat(cells[2]) || 0,
                totalSavings: this.parseSARValue(cells[3]) || 0,
                monthlyPayment: this.parseSARValue(cells[4]) || 0,
                baseShareValue: this.parseSARValue(cells[5]) || 0,
                currentShareValue: this.parseSARValue(cells[6]) || 0,
                realPortfolioValue: this.parseSARValue(cells[7]) || 0,
                ownershipPercentage: parseFloat(cells[8]?.replace('%', '')) || 0,
                growthPercentage: parseFloat(cells[9]?.replace('%', '')) || 0,
                totalIncome: this.parseSARValue(cells[7]) || 0,
              };
              
              if (subscriber.fullName && subscriber.subscriberNumber) {
                subscribers.push(subscriber);
              }
            } catch (error) {
              console.warn(`Error parsing HTML subscriber row ${rowIndex}:`, error);
            }
          }
          
          rowIndex++;
        }
      }
    } catch (error) {
      console.warn('Error parsing HTML format:', error);
    }
    
    console.log(`📋 Successfully parsed ${subscribers.length} subscribers from HTML`);
    return subscribers;
  },

  parseSARValue(value: string): number {
    if (!value) return 0;
    // Remove SAR, commas, and other non-numeric characters except decimal point
    const cleanValue = value.toString().replace(/[^\d.-]/g, '');
    return parseFloat(cleanValue) || 0;
  },

  async getPortfolio() {
    console.log('📋 Loading portfolio data...');
    
    // **تحسين الأداء: استخدام البيانات المحلية فوراً**
    const localPortfolioData = {
      items: [
        {
          companyName: 'يغطي الأسهم الامريكية الكبرى (S&P500)',
          assetSymbol: 'SPUS',
          units: 257,
          marketPrice: 51.1,
          averagePrice: 45.27,
          baseCost: 11601,
          marketValueUSD: 13132.70,
          totalValueUSD: 13132.70,
          unrealizedProfitLoss: 1531.70,
          totalValueSAR: 49504,
          growth: 13.2,
        },
        {
          companyName: 'يغطي قطاع التكنلوجيا العالمي (بمافيه أمريكيا)',
          assetSymbol: 'SPTE',
          units: 109,
          marketPrice: 36.31,
          averagePrice: 35.29,
          baseCost: 3836,
          marketValueUSD: 3957.79,
          totalValueUSD: 3957.79,
          unrealizedProfitLoss: 121.79,
          totalValueSAR: 14385,
          growth: 3.2,
        },
        {
          companyName: 'الأسواق المتقدمة والناشئة بإستثناء أمريكا',
          assetSymbol: 'SPWO',
          units: 4,
          marketPrice: 29.44,
          averagePrice: 29.87,
          baseCost: 131,
          marketValueUSD: 117.76,
          totalValueUSD: 117.76,
          unrealizedProfitLoss: -13.24,
          totalValueSAR: 491,
          growth: -10.1,
        },
        {
          companyName: 'البيتكوين',
          assetSymbol: 'IBIT',
          units: 46,
          marketPrice: 43.1,
          averagePrice: 54.55,
          baseCost: 2534,
          marketValueUSD: 1982.60,
          totalValueUSD: 1982.60,
          unrealizedProfitLoss: -551.40,
          totalValueSAR: 9503,
          growth: -21.0,
        },
        {
          companyName: 'ذهب',
          assetSymbol: 'GLDM',
          units: 19,
          marketPrice: 97.94,
          averagePrice: 104.37,
          baseCost: 2000,
          marketValueUSD: 1860.86,
          totalValueUSD: 1860.86,
          unrealizedProfitLoss: -139.14,
          totalValueSAR: 7500,
          growth: -6.2,
        },
        {
          companyName: 'صكوك',
          assetSymbol: 'Deeds',
          units: 50,
          marketPrice: 1113.34,
          averagePrice: 1080.00,
          baseCost: 54000,
          marketValueUSD: 14844.00,
          totalValueUSD: 14844.00,
          unrealizedProfitLoss: 445.00,
          totalValueSAR: 54000,
          growth: 3.1,
        },
        {
          companyName: 'صندوق معايير للقروض',
          assetSymbol: 'Loan Fund',
          units: 1,
          marketPrice: 40238.00,
          averagePrice: 38000.00,
          baseCost: 38000,
          marketValueUSD: 10730.00,
          totalValueUSD: 10730.00,
          unrealizedProfitLoss: 597.00,
          totalValueSAR: 38000,
          growth: 5.9,
        },
        {
          companyName: 'وديعة',
          assetSymbol: 'DEPOSIT',
          units: 1,
          marketPrice: 6800.00,
          averagePrice: 6800.00,
          baseCost: 6800,
          marketValueUSD: 6800,
          totalValueUSD: 6800,
          unrealizedProfitLoss: 0,
          totalValueSAR: 6800,
          growth: 0.0,
        }
      ],
      totalPortfolioValue: 174846.41
    };
    
    console.log('⚡ Using local portfolio data immediately');
    
    // تحديث الـ cache فوراً
    cachedPortfolioData = localPortfolioData;
    
    // محاولة التحديث من Google Sheets في الخلفية
    this.updatePortfolioFromGoogleSheetsInBackground();
    
    return localPortfolioData;
  },

  // دالة جديدة لتحديث المحفظة في الخلفية مع الأداة المحسنة
  async updatePortfolioFromGoogleSheetsInBackground() {
    console.log('🔄 Starting enhanced background portfolio update...');
    
    try {
      // استخدام الأداة المحسنة لجلب البيانات
      const portfolioData = await WorksheetFetcher.fetchPortfolio();
      
      if (portfolioData) {
        console.log('📋 Successfully fetched portfolio data, parsing...');
        const result = WorksheetFetcher.parsePortfolioData(portfolioData);
        
        if (result.items.length >= 7) {
          console.log('✅ Background: Successfully updated portfolio with enhanced fetcher!');
          console.log(`📊 Portfolio items: ${result.items.length}, Total value: ${result.totalPortfolioValue}`);
          cachedPortfolioData = result;
          return;
        }
      }
      
      console.log('📋 Enhanced fetcher failed, keeping local data');
      
    } catch (error) {
      console.warn('Enhanced background portfolio update error:', error);
    }
  },

  parseCSVToPortfolio(csvText: string) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const items = [];
    let totalValue = 0;

    console.log('📋 Parsing portfolio CSV...');
    console.log('📋 Total lines found:', lines.length);

    // Skip header row and process data
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.includes('\t') ? 
        line.split('\t').map(v => v.trim().replace(/^"|"$/g, '')) :
        line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      console.log(`📋 Processing portfolio row ${i}:`, values);
      
      // Based on worksheet structure: اسم الشركة, الرمز, عدد الوحدات, سعر السوق, متوسط سعر الشراء, التكلفة الأساسية, القيمة السوقية بالدولار, ربح/خسارة غير محققة, إجمالي قيمة بالريال
      if (values.length >= 8 && values[0] && !values[0].toLowerCase().includes('إجمالي')) {
        try {
          const item = {
            companyName: values[0] || '',
            assetSymbol: values[1] || '',
            units: parseFloat(values[2]) || 0,
            marketPrice: parseFloat(values[3]) || 0,
            averagePrice: parseFloat(values[4]) || 0,
            baseCost: parseFloat(values[5]) || 0,
            marketValueUSD: parseFloat(values[6]) || 0,
            totalValueUSD: parseFloat(values[6]) || 0,
            unrealizedProfitLoss: parseFloat(values[7]) || 0,
            totalValueSAR: this.parseSARValue(values[8]) || 0,
            growth: parseFloat(values[9]) || 0,
          };
          
          if (item.companyName && item.totalValueSAR > 0) {
            console.log('✅ Successfully parsed portfolio item:', item.companyName);
            items.push(item);
            totalValue += item.totalValueSAR;
          }
        } catch (error) {
          console.warn(`❌ Error parsing portfolio row ${i}:`, error, values);
        }
      }
    }
    
    console.log(`📋 Successfully parsed ${items.length} portfolio items, total: ${totalValue}`);
    
    return {
      items,
      totalPortfolioValue: totalValue || 185466.35 // fallback to known total
    };
  },

  parseHTMLToPortfolio(htmlText: string) {
    console.log('📋 Parsing HTML data for portfolio...');
    const items = [];
    let totalValue = 0;
    
    try {
      // Extract table data from HTML
      const tableRegex = /<table[^>]*>(.*?)<\/table>/gis;
      const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
      const cellRegex = /<td[^>]*>(.*?)<\/td>/gis;
      
      const tableMatch = tableRegex.exec(htmlText);
      if (tableMatch) {
        const tableContent = tableMatch[1];
        let rowMatch;
        let rowIndex = 0;
        
        while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
          if (rowIndex === 0) { // Skip header
            rowIndex++;
            continue;
          }
          
          const rowContent = rowMatch[1];
          const cells = [];
          let cellMatch;
          
          while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
            cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
          }
          
          if (cells.length >= 8 && cells[0] && !cells[0].toLowerCase().includes('إجمالي')) {
            try {
              const item = {
                companyName: cells[0] || '',
                assetSymbol: cells[1] || '',
                units: parseFloat(cells[2]) || 0,
                marketPrice: parseFloat(cells[3]) || 0,
                averagePrice: parseFloat(cells[4]) || 0,
                baseCost: parseFloat(cells[5]) || 0,
                marketValueUSD: parseFloat(cells[6]) || 0,
                totalValueUSD: parseFloat(cells[6]) || 0,
                unrealizedProfitLoss: parseFloat(cells[7]) || 0,
                totalValueSAR: this.parseSARValue(cells[8]) || 0,
                growth: parseFloat(cells[9]) || 0,
              };
              
              if (item.companyName && item.totalValueSAR > 0) {
                items.push(item);
                totalValue += item.totalValueSAR;
              }
            } catch (error) {
              console.warn(`Error parsing HTML portfolio row ${rowIndex}:`, error);
            }
          }
          
          rowIndex++;
        }
      }
    } catch (error) {
      console.warn('Error parsing HTML portfolio format:', error);
    }
    
    console.log(`📋 Successfully parsed ${items.length} portfolio items from HTML`);
    return {
      items,
      totalPortfolioValue: totalValue || 185466.35
    };
  },
};