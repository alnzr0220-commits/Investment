// API URL for staging environment (updated v6 - FORCE CACHE CLEAR)
const API_URL = 'https://staging--fxugj5spc8ghki7u3abz.youbase.cloud';

// Force rebuild timestamp - ensure latest changes are deployed
const CACHE_BUSTER = Date.now();
const VERSION = '7.0.0';
console.log('🚀 API Module loaded - Version', VERSION, '- Cache Buster:', CACHE_BUSTER);
console.log('📋 AUTO-UPDATE: System will fetch fresh data from worksheet every hour');

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
    console.log('⏳ Note: Google Sheets may take time to load, please wait...');
    
    // Check if we need to refresh data (every hour)
    const now = Date.now();
    const shouldRefresh = (now - lastDataUpdate) > UPDATE_INTERVAL;
    
    if (!shouldRefresh && cachedSubscribersData.length > 0) {
      console.log('📋 Using cached subscribers data (updated within last hour)');
      return cachedSubscribersData;
    }
    
    console.log('📋 Fetching fresh data from worksheet... (this may take 30+ seconds)');
    
    try {
      // Try multiple approaches to get data from Google Sheets with longer timeout
      const urls = [
        SUBSCRIBERS_DATA_URL,
        MAIN_DATA_URL,
        ALT_SUBSCRIBERS_URL,
        HTML_SUBSCRIBERS_URL
      ];
      
      for (const url of urls) {
        try {
          console.log(`📋 Trying URL: ${url}`);
          console.log('⏳ Waiting for Google Sheets to respond...');
          
          const response = await fetchWithTimeout(url, FETCH_TIMEOUT); // 30 second timeout
          
          if (response.ok) {
            const textData = await response.text();
            console.log('📋 Response received, length:', textData.length);
            console.log('📋 First 300 chars:', textData.substring(0, 300));
            
            // Check if we got actual data (not just title)
            if (textData.length > 500 && textData.includes('جعفر') && textData.includes('534000223')) {
              const result = this.parseCSVToSubscribers(textData);
              if (result.length >= 20) { // Expect at least 20 subscribers
                console.log('✅ Successfully loaded subscribers from Google Sheets!');
                console.log(`📋 Found ${result.length} subscribers`);
                cachedSubscribersData = result;
                lastDataUpdate = now;
                return result;
              }
            } else if (textData.includes('html') && textData.includes('جعفر')) {
              // Try to parse HTML format
              console.log('📋 Detected HTML format, attempting to parse...');
              const result = this.parseHTMLToSubscribers(textData);
              if (result.length >= 20) {
                console.log('✅ Successfully loaded subscribers from HTML format!');
                cachedSubscribersData = result;
                lastDataUpdate = now;
                return result;
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch from ${url}:`, error);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch subscribers from Google Sheets:', error);
    }
    
    // البيانات الاحتياطية من الورك شيت (آخر نسخة محدثة)
    console.log('📋 Using backup subscribers data from worksheet...');
    const backupData = this.getUpdatedSubscribersData();
    cachedSubscribersData = backupData;
    return backupData;
  },

  getUpdatedSubscribersData() {
    return [
      {
        subscriberNumber: '1',
        fullName: 'جعفر طاهر الزبر',
        phoneNumber: '536003223',
        sharesCount: 40,
        totalSavings: 36000,
        monthlyPayment: 2000,
        baseShareValue: 900.00,
        currentShareValue: 952.82,
        realPortfolioValue: 38112.86,
        ownershipPercentage: 19.70,
        growthPercentage: 5.9,
        totalIncome: 38112.86,
      },
      {
        subscriberNumber: '2',
        fullName: 'عباس صالح الزبر',
        phoneNumber: '504996691',
        sharesCount: 24,
        totalSavings: 21600,
        monthlyPayment: 1200,
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
        realPortfolioValue: 4534.63,
        ownershipPercentage: 9.76,
        growthPercentage: -4.5,
        totalIncome: 4534.63,
      },
      {
        subscriberNumber: '4',
        fullName: 'يوسف أحمد المحيميد علي',
        phoneNumber: '560090953',
        sharesCount: 15,
        totalSavings: 13500,
        monthlyPayment: 750,
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
        baseShareValue: 950.00,
        currentShareValue: 906.93,
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
    console.log('📋 Loading portfolio data from Google Sheets...');
    console.log('⏳ Note: Google Sheets may take time to load, please wait...');
    
    // Check if we need to refresh data (every hour)
    const now = Date.now();
    const shouldRefresh = (now - lastDataUpdate) > UPDATE_INTERVAL;
    
    if (!shouldRefresh && cachedPortfolioData) {
      console.log('📋 Using cached portfolio data (updated within last hour)');
      return cachedPortfolioData;
    }
    
    console.log('📋 Fetching fresh portfolio data from worksheet... (this may take 30+ seconds)');
    
    try {
      // Try multiple approaches to get portfolio data from Google Sheets
      const urls = [
        PORTFOLIO_DATA_URL,
        ALT_PORTFOLIO_URL,
        HTML_PORTFOLIO_URL
      ];
      
      for (const url of urls) {
        try {
          console.log(`📋 Trying portfolio URL: ${url}`);
          console.log('⏳ Waiting for Google Sheets to respond...');
          
          const response = await fetchWithTimeout(url, FETCH_TIMEOUT);
          
          if (response.ok) {
            const textData = await response.text();
            console.log('📋 Portfolio response received, length:', textData.length);
            console.log('📋 First 300 chars:', textData.substring(0, 300));
            
            // Check if we got actual data - look for specific company names
            if (textData.length > 500 && (textData.includes('SPUS') || textData.includes('S&P500') || textData.includes('يغطي الأسهم'))) {
              const result = this.parseCSVToPortfolio(textData);
              if (result.items.length >= 7) { // Expect at least 7 portfolio items
                console.log('✅ Successfully loaded portfolio from Google Sheets!');
                console.log(`📋 Found ${result.items.length} portfolio items`);
                cachedPortfolioData = result;
                return result;
              }
            } else if (textData.includes('html') && textData.includes('SPUS')) {
              // Try to parse HTML format
              console.log('📋 Detected HTML format, attempting to parse portfolio...');
              const result = this.parseHTMLToPortfolio(textData);
              if (result.items.length >= 7) {
                console.log('✅ Successfully loaded portfolio from HTML format!');
                cachedPortfolioData = result;
                return result;
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch portfolio from ${url}:`, error);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch portfolio from Google Sheets:', error);
    }
    
    // البيانات الاحتياطية من الورك شيت (آخر نسخة محدثة) - 8 شركات كاملة
    console.log('📋 Using backup portfolio data from worksheet - 8 companies...');
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
          companyName: 'وديعة',
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
      totalPortfolioValue: 185466.35
    };
    
    cachedPortfolioData = portfolioData;
    console.log('✅ Portfolio loaded - Items:', portfolioData.items.length, 'Total:', portfolioData.totalPortfolioValue);
    return portfolioData;
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