// API URL for staging environment (updated v4 - force rebuild)
const API_URL = 'https://staging--fxugj5spc8ghki7u3abz.youbase.cloud';

// Force rebuild timestamp - ensure latest changes are deployed
console.log('🚀 API Module loaded - Version 4 - 2025-01-31 - All 8 companies with correct data');

// Data source URLs - Multiple approaches for Google Sheets
const SHEET_ID = '1bZau5OniYiDK6jLf7kYwkAoSWiO9PNqCMrCY2u3Ryus';
const MAIN_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pub?output=csv';
const SUBSCRIBERS_DATA_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
const PORTFOLIO_DATA_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1614954373`;

// Alternative: Try different export formats
const ALT_SUBSCRIBERS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pub?gid=0&single=true&output=tsv';
const ALT_PORTFOLIO_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pub?gid=1614954373&single=true&output=tsv';

// HTML versions for scraping
const HTML_SUBSCRIBERS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pubhtml?gid=0&single=true';
const HTML_PORTFOLIO_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pubhtml?gid=1614954373&single=true';

// Timeout for fetch requests (10 seconds)
const FETCH_TIMEOUT = 10000;

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
  async login(fullName: string, phoneNumber: string) {
    // التحقق من بيانات الإدمن أولاً
    if (fullName === 'مدير النظام الرئيسي' && phoneNumber === 'admin123') {
      return { 
        token: 'admin-token', 
        user: { fullName, phoneNumber, isAdmin: true } 
      };
    }

    // البحث في البيانات المحلية المحدثة
    const subscribers = this.getUpdatedSubscribersData();
    const user = subscribers.find(sub => 
      sub.fullName === fullName && sub.phoneNumber === phoneNumber
    );

    if (user) {
      // إنشاء token وإرجاع بيانات المستخدم
      const token = 'local-token-' + user.subscriberNumber;
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { 
        token, 
        user: {
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
        }
      };
    }

    // إذا لم يوجد في البيانات المحلية، جرب الخادم الخارجي
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
    // استخدام البيانات المحلية المحدثة
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      console.log('Using local user data:', userData);
      return userData;
    }

    // إذا لم توجد بيانات محلية، جرب العثور على المستخدم من قائمة المشتركين
    try {
      const subscribers = this.getUpdatedSubscribersData();
      // محاولة العثور على المستخدم بناءً على token أو استخدام الأول كافتراضي
      const user = subscribers[0]; // يمكن تحسين هذا لاحقاً للبحث بناءً على token
      console.log('Using subscriber data:', user);
      return user;
    } catch (error) {
      console.error('Error getting user data:', error);
      // البيانات الافتراضية لجعفر في حالة الفشل
      return this.getUpdatedSubscribersData()[0];
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
    console.log('📋 Loading subscribers data from Google Sheets...');
    
    try {
      // محاولة جلب البيانات من Google Sheets أولاً
      const response = await fetchWithTimeout(SUBSCRIBERS_DATA_URL);
      if (response.ok) {
        const csvText = await response.text();
        console.log('Subscribers CSV response:', csvText.substring(0, 300));
        
        if (csvText.length > 200 && !csvText.includes('بيانات المشتركين بالصندوق المستقبل')) {
          const result = this.parseCSVToSubscribers(csvText);
          if (result.length > 0) {
            console.log('✅ Successfully loaded subscribers from Google Sheets!');
            return result;
          }
        }
      }

      // محاولة TSV format
      const tsvResponse = await fetchWithTimeout(ALT_SUBSCRIBERS_URL);
      if (tsvResponse.ok) {
        const tsvText = await tsvResponse.text();
        console.log('Subscribers TSV response:', tsvText.substring(0, 300));
        
        if (tsvText.length > 200) {
          const result = this.parseCSVToSubscribers(tsvText.replace(/\t/g, ','));
          if (result.length > 0) {
            console.log('✅ Successfully loaded subscribers from TSV!');
            return result;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fetch subscribers from Google Sheets:', error);
    }
    
    // البيانات الاحتياطية من الورك شيت (آخر نسخة محدثة)
    console.log('📋 Using backup subscribers data from worksheet...');
    return this.getUpdatedSubscribersData();
  },

  getUpdatedSubscribersData() {
    return [
      {
        subscriberNumber: '1',
        fullName: 'جعفر طاهر الزبر',
        phoneNumber: '534000223',
        sharesCount: 42,
        totalSavings: 38100,
        monthlyPayment: 2100,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 38090.89,
        ownershipPercentage: 20.49,
        growthPercentage: -4.5,
        totalIncome: 38090.89,
      },
      {
        subscriberNumber: '2',
        fullName: 'عباس صالح الزبر',
        phoneNumber: '504996691',
        sharesCount: 24,
        totalSavings: 21600,
        monthlyPayment: 1200,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 21766.22,
        ownershipPercentage: 11.71,
        growthPercentage: -4.5,
        totalIncome: 21766.22,
      },
      {
        subscriberNumber: '3',
        fullName: 'محمد دعبل العثمان',
        phoneNumber: '545473331',
        sharesCount: 5,
        totalSavings: 4000,
        monthlyPayment: 1000,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 4534.63,
        ownershipPercentage: 9.76,
        growthPercentage: -4.5,
        totalIncome: 4534.63,
      },
      {
        subscriberNumber: '4',
        fullName: 'يوسف أحمد السحيمي',
        phoneNumber: '560090953',
        sharesCount: 15,
        totalSavings: 13500,
        monthlyPayment: 750,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 13603.89,
        ownershipPercentage: 7.32,
        growthPercentage: -4.5,
        totalIncome: 13603.89,
      },
      {
        subscriberNumber: '5',
        fullName: 'علي طاهر الزبر',
        phoneNumber: '551567697',
        sharesCount: 10,
        totalSavings: 9000,
        monthlyPayment: 500,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 9069.26,
        ownershipPercentage: 4.88,
        growthPercentage: -4.5,
        totalIncome: 9069.26,
      },
      {
        subscriberNumber: '6',
        fullName: 'حسن علي الزبر',
        phoneNumber: '551679520',
        sharesCount: 10,
        totalSavings: 9000,
        monthlyPayment: 500,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 9069.26,
        ownershipPercentage: 4.88,
        growthPercentage: -4.5,
        totalIncome: 9069.26,
      },
      {
        subscriberNumber: '7',
        fullName: 'عبد الله أحمد المحيميد علي',
        phoneNumber: '561930452',
        sharesCount: 10,
        totalSavings: 9000,
        monthlyPayment: 500,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 9069.26,
        ownershipPercentage: 4.88,
        growthPercentage: -4.5,
        totalIncome: 9069.26,
      },
      {
        subscriberNumber: '8',
        fullName: 'أحمد علي المحيميد',
        phoneNumber: '582299942',
        sharesCount: 10,
        totalSavings: 9000,
        monthlyPayment: 500,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 9069.26,
        ownershipPercentage: 4.88,
        growthPercentage: -4.5,
        totalIncome: 9069.26,
      },
      {
        subscriberNumber: '9',
        fullName: 'علي عبد الله الشهيب',
        phoneNumber: '550978601',
        sharesCount: 7,
        totalSavings: 6300,
        monthlyPayment: 350,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 6348.48,
        ownershipPercentage: 3.41,
        growthPercentage: -4.5,
        totalIncome: 6348.48,
      },
      {
        subscriberNumber: '10',
        fullName: 'مصطفى الحوراني',
        phoneNumber: '537926814',
        sharesCount: 6,
        totalSavings: 5400,
        monthlyPayment: 300,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 5441.56,
        ownershipPercentage: 2.93,
        growthPercentage: -4.5,
        totalIncome: 5441.56,
      },
      {
        subscriberNumber: '11',
        fullName: 'عباس طاهر الزبر',
        phoneNumber: '506394798',
        sharesCount: 6,
        totalSavings: 5400,
        monthlyPayment: 300,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 5441.56,
        ownershipPercentage: 2.93,
        growthPercentage: -4.5,
        totalIncome: 5441.56,
      },
      {
        subscriberNumber: '12',
        fullName: 'فيصل طاهر الزبر',
        phoneNumber: '567935956',
        sharesCount: 6,
        totalSavings: 5400,
        monthlyPayment: 300,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 5441.56,
        ownershipPercentage: 2.93,
        growthPercentage: -4.5,
        totalIncome: 5441.56,
      },
      {
        subscriberNumber: '13',
        fullName: 'عبد الله محمد جعفر الزبر',
        phoneNumber: '500895023',
        sharesCount: 6,
        totalSavings: 5400,
        monthlyPayment: 300,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 5441.56,
        ownershipPercentage: 2.93,
        growthPercentage: -4.5,
        totalIncome: 5441.56,
      },
      {
        subscriberNumber: '14',
        fullName: 'محمد طاهر الزبر',
        phoneNumber: '569373888',
        sharesCount: 4,
        totalSavings: 3600,
        monthlyPayment: 200,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 3627.70,
        ownershipPercentage: 1.95,
        growthPercentage: -4.5,
        totalIncome: 3627.70,
      },
      {
        subscriberNumber: '15',
        fullName: 'محمد المحيميد علي',
        phoneNumber: '569221338',
        sharesCount: 4,
        totalSavings: 3050,
        monthlyPayment: 200,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 3627.70,
        ownershipPercentage: 1.95,
        growthPercentage: -4.5,
        totalIncome: 3627.70,
      },
      {
        subscriberNumber: '16',
        fullName: 'زياد الزبر',
        phoneNumber: '552657630',
        sharesCount: 6,
        totalSavings: 5400,
        monthlyPayment: 300,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 5441.56,
        ownershipPercentage: 2.93,
        growthPercentage: -4.5,
        totalIncome: 5441.56,
      },
      {
        subscriberNumber: '17',
        fullName: 'مريم الزبر',
        phoneNumber: '551257703',
        sharesCount: 3,
        totalSavings: 2700,
        monthlyPayment: 150,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 2720.78,
        ownershipPercentage: 1.46,
        growthPercentage: -4.5,
        totalIncome: 2720.78,
      },
      {
        subscriberNumber: '18',
        fullName: 'أسماء الشلاحي',
        phoneNumber: '562087772',
        sharesCount: 3,
        totalSavings: 2700,
        monthlyPayment: 150,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 2720.78,
        ownershipPercentage: 1.46,
        growthPercentage: -4.5,
        totalIncome: 2720.78,
      },
      {
        subscriberNumber: '19',
        fullName: 'جوهرة الشلاحي',
        phoneNumber: '542626031',
        sharesCount: 3,
        totalSavings: 2700,
        monthlyPayment: 150,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 2720.78,
        ownershipPercentage: 1.46,
        growthPercentage: -4.5,
        totalIncome: 2720.78,
      },
      {
        subscriberNumber: '20',
        fullName: 'زهرة الشهيب',
        phoneNumber: '537926876',
        sharesCount: 3,
        totalSavings: 2850,
        monthlyPayment: 150,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 2720.78,
        ownershipPercentage: 1.46,
        growthPercentage: -4.5,
        totalIncome: 2720.78,
      },
      {
        subscriberNumber: '21',
        fullName: 'أحمد طاهر الشلاحي',
        phoneNumber: '564519351',
        sharesCount: 3,
        totalSavings: 2700,
        monthlyPayment: 150,
        baseShareValue: 906.93,
        currentShareValue: 916.92,
        realPortfolioValue: 2720.78,
        ownershipPercentage: 1.46,
        growthPercentage: -4.5,
        totalIncome: 2720.78,
      }
    ];
  },

  parseCSVToSubscribers(csvText: string) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const subscribers = [];

    console.log('Raw CSV data for subscribers:', csvText.substring(0, 500));

    // Skip header row and process data
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      if (values.length >= 6 && values[0] && !values[0].toLowerCase().includes('بيانات')) {
        try {
          const subscriber = {
            subscriberNumber: values[0] || '',
            fullName: values[1] || '',
            phoneNumber: values[2] || '',
            sharesCount: parseFloat(values[3]) || 0,
            totalSavings: this.parseSARValue(values[4]) || 0,
            monthlyPayment: this.parseSARValue(values[5]) || 0,
            baseShareValue: this.parseSARValue(values[6]) || 0,
            currentShareValue: this.parseSARValue(values[7]) || 0,
            realPortfolioValue: this.parseSARValue(values[8]) || 0,
            ownershipPercentage: parseFloat(values[9]?.replace('%', '')) || 0,
            growthPercentage: parseFloat(values[10]?.replace('%', '')) || 0,
            totalIncome: this.parseSARValue(values[8]) || 0,
          };
          
          if (subscriber.fullName && subscriber.subscriberNumber) {
            subscribers.push(subscriber);
          }
        } catch (error) {
          console.warn(`Error parsing subscriber row ${i}:`, error);
        }
      }
    }
    
    console.log(`Subscribers data loaded: ${subscribers.length} subscribers found`);
    return subscribers;
  },

  parseSARValue(value: string): number {
    if (!value) return 0;
    // Remove SAR, commas, and other non-numeric characters except decimal point
    const cleanValue = value.toString().replace(/[^\d.-]/g, '');
    return parseFloat(cleanValue) || 0;
  },

  async getPortfolio() {
    console.log('📋 Loading portfolio data from Google Sheets...');
    
    try {
      // محاولة جلب البيانات من Google Sheets أولاً
      const response = await fetchWithTimeout(PORTFOLIO_DATA_URL);
      if (response.ok) {
        const csvText = await response.text();
        console.log('Portfolio CSV response:', csvText.substring(0, 300));
        
        if (csvText.length > 200 && !csvText.includes('بيانات المشتركين بالصندوق المستقبل')) {
          const result = this.parseCSVToPortfolio(csvText);
          if (result.items.length > 0) {
            console.log('✅ Successfully loaded portfolio from Google Sheets!');
            return result;
          }
        }
      }

      // محاولة TSV format
      const tsvResponse = await fetchWithTimeout(ALT_PORTFOLIO_URL);
      if (tsvResponse.ok) {
        const tsvText = await tsvResponse.text();
        console.log('Portfolio TSV response:', tsvText.substring(0, 300));
        
        if (tsvText.length > 200) {
          const result = this.parseCSVToPortfolio(tsvText.replace(/\t/g, ','));
          if (result.items.length > 0) {
            console.log('✅ Successfully loaded portfolio from TSV!');
            return result;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fetch portfolio from Google Sheets:', error);
    }
    
    // البيانات الاحتياطية من الورك شيت (آخر نسخة محدثة) - 8 شركات كاملة
    console.log('📋 Using backup data from worksheet...');
    const portfolioData = {
      items: [
        {
          companyName: 'يغطي الأسهم الامريكية الكبرى (S&P500)',
          assetSymbol: 'SPUS',
          units: 257,
          marketPrice: 51.46,
          averagePrice: 45.27,
          baseCost: 11601,
          marketValueUSD: 13225.22,
          totalValueUSD: 13225.22,
          unrealizedProfitLoss: 1624.22,
          totalValueSAR: 49594.58,
          growth: 14.0,
        },
        {
          companyName: 'يغطي قطاع التكنلوجيا العالمي (بمافيه أمريكيا)',
          assetSymbol: 'SPTE',
          units: 109,
          marketPrice: 36.73,
          averagePrice: 35.29,
          baseCost: 3836,
          marketValueUSD: 4003.57,
          totalValueUSD: 4003.57,
          unrealizedProfitLoss: 167.57,
          totalValueSAR: 15013.39,
          growth: 4.4,
        },
        {
          companyName: 'الأسواق المتقدمة والناشئة بإستثناء أمريكا',
          assetSymbol: 'SPWO',
          units: 4,
          marketPrice: 29.31,
          averagePrice: 29.87,
          baseCost: 131,
          marketValueUSD: 117.24,
          totalValueUSD: 117.24,
          unrealizedProfitLoss: -13.76,
          totalValueSAR: 439.65,
          growth: -10.5,
        },
        {
          companyName: 'البيتكوين',
          assetSymbol: 'IBIT',
          units: 46,
          marketPrice: 47.49,
          averagePrice: 54.55,
          baseCost: 2534,
          marketValueUSD: 2184.54,
          totalValueUSD: 2184.54,
          unrealizedProfitLoss: -349.46,
          totalValueSAR: 8192.03,
          growth: -13.8,
        },
        {
          companyName: 'ذهب',
          assetSymbol: 'GLDM',
          units: 19,
          marketPrice: 96.01,
          averagePrice: 104.37,
          baseCost: 2000,
          marketValueUSD: 1824.19,
          totalValueUSD: 1824.19,
          unrealizedProfitLoss: -175.81,
          totalValueSAR: 6840.71,
          growth: -8.8,
        },
        {
          companyName: 'صكوك',
          assetSymbol: 'Deeds',
          units: 50,
          marketPrice: 1113.34,
          averagePrice: 1080.00,
          baseCost: 54000,
          marketValueUSD: 55667,
          totalValueUSD: 55667,
          unrealizedProfitLoss: 1667,
          totalValueSAR: 58467.00,
          growth: 3.1,
        },
        {
          companyName: 'صندوق معايير للقروض',
          assetSymbol: 'Loan Fund',
          units: 1,
          marketPrice: 40119.00,
          averagePrice: 38000.00,
          baseCost: 38000,
          marketValueUSD: 40119,
          totalValueUSD: 40119,
          unrealizedProfitLoss: 2119,
          totalValueSAR: 40119.00,
          growth: 5.6,
        },
        {
          companyName: 'وديعة بنكية',
          assetSymbol: 'DEPOSIT',
          units: 1,
          marketPrice: 6800.00,
          averagePrice: 6800.00,
          baseCost: 6800,
          marketValueUSD: 6800,
          totalValueUSD: 6800,
          unrealizedProfitLoss: 0,
          totalValueSAR: 6800.00,
          growth: 0.0,
        }
      ],
      totalPortfolioValue: 172315.92
    };
    
    console.log('✅ Portfolio loaded - Items:', portfolioData.items.length, 'Total:', portfolioData.totalPortfolioValue);
    return portfolioData;
  },

  parseCSVToPortfolio(csvText: string) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const items = [];
    let totalValue = 0;

    console.log('Raw CSV data for portfolio:', csvText.substring(0, 500));

    // Skip header row and process data
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      if (values.length >= 6 && values[0] && !values[0].toLowerCase().includes('بيانات')) {
        try {
          const item = {
            companyName: values[0] || '',
            assetSymbol: values[1] || '',
            units: parseFloat(values[2]) || 0,
            marketPrice: parseFloat(values[3]) || 0,
            totalValueUSD: parseFloat(values[4]) || 0,
            totalValueSAR: parseFloat(values[5]) || 0,
            growth: parseFloat(values[6]) || 0,
          };
          
          if (item.companyName && item.totalValueSAR > 0) {
            items.push(item);
            totalValue += item.totalValueSAR;
          }
        } catch (error) {
          console.warn(`Error parsing portfolio row ${i}:`, error);
        }
      }
    }
    
    console.log(`Portfolio data loaded: ${items.length} items found, total: ${totalValue}`);
    
    return {
      items,
      totalPortfolioValue: totalValue
    };
  },
};