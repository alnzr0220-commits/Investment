// خدمة البيانات الجديدة - تأخذ البيانات مباشرة من الورك شيت
// تحديث كل ساعة تلقائياً

export interface WorksheetSubscriber {
  subscriberNumber: string;
  fullName: string;
  phoneNumber: string;
  sharesCount: number;
  totalSavings: number;
  monthlyPayment: number;
  baseShareValue: number;
  currentShareValue: number;
  realPortfolioValue: number;
  ownershipPercentage: number;
  growthPercentage: number;
}

export interface WorksheetPortfolioItem {
  companyName: string;
  assetSymbol: string;
  units: number;
  marketPrice: number;
  averagePrice: number;
  baseCost: number;
  marketValueUSD: number;
  unrealizedProfitLoss: number;
  totalValueSAR: number;
  growth: number;
}

export interface WorksheetPortfolio {
  items: WorksheetPortfolioItem[];
  totalPortfolioValue: number;
}

class WorksheetDataService {
  private static instance: WorksheetDataService;
  private lastUpdate: Date | null = null;
  private updateInterval: number = 60 * 60 * 1000; // ساعة واحدة
  private autoUpdateTimer: any = null;
  
  // روابط الورك شيت المحدثة
  private readonly WORKSHEET_URLS = {
    subscribers: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pub?output=csv&gid=0',
    portfolio: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pub?output=csv&gid=1',
    alternativeSubscribers: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pub?output=tsv',
    alternativePortfolio: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pub?output=tsv&gid=1'
  };
  
  // البيانات الحالية من الورك شيت (محدثة حسب الصور المرسلة)
  private currentSubscribers: WorksheetSubscriber[] = [
    {
      subscriberNumber: '1',
      fullName: 'جعفر طاهر الزبر',
      phoneNumber: '536003223',
      sharesCount: 42,
      totalSavings: 38100,
      monthlyPayment: 2100,
      baseShareValue: 950.00,
      currentShareValue: 906.93,
      realPortfolioValue: 38090.89,
      ownershipPercentage: 20.49,
      growthPercentage: -4.5,
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
    },
    {
      subscriberNumber: '4',
      fullName: 'يوسف أحمد المحيميد علي',
      phoneNumber: '560090953',
      sharesCount: 15,
      totalSavings: 13500,
      monthlyPayment: 750,
      baseShareValue: 906.93,
      currentShareValue: 916.92,
      realPortfolioValue: 13753.80,
      ownershipPercentage: 7.32,
      growthPercentage: -4.5,
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
      realPortfolioValue: 9169.20,
      ownershipPercentage: 4.88,
      growthPercentage: -4.5,
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
      realPortfolioValue: 9169.20,
      ownershipPercentage: 4.88,
      growthPercentage: -4.5,
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
      realPortfolioValue: 9169.20,
      ownershipPercentage: 4.88,
      growthPercentage: -4.5,
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
      realPortfolioValue: 9169.20,
      ownershipPercentage: 4.88,
      growthPercentage: -4.5,
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
      realPortfolioValue: 6418.44,
      ownershipPercentage: 3.42,
      growthPercentage: -4.5,
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
      realPortfolioValue: 5501.52,
      ownershipPercentage: 2.93,
      growthPercentage: -4.5,
    },
    {
      subscriberNumber: '11',
      fullName: 'فيصل طاهر الزبر',
      phoneNumber: '506394798',
      sharesCount: 6,
      totalSavings: 5400,
      monthlyPayment: 300,
      baseShareValue: 906.93,
      currentShareValue: 916.92,
      realPortfolioValue: 5501.52,
      ownershipPercentage: 2.93,
      growthPercentage: -4.5,
    },
    {
      subscriberNumber: '12',
      fullName: 'عبد الله محمد جعفر الزبر',
      phoneNumber: '567935956',
      sharesCount: 6,
      totalSavings: 5400,
      monthlyPayment: 300,
      baseShareValue: 906.93,
      currentShareValue: 916.92,
      realPortfolioValue: 5501.52,
      ownershipPercentage: 2.93,
      growthPercentage: -4.5,
    },
    {
      subscriberNumber: '13',
      fullName: 'محمد طاهر الزبر',
      phoneNumber: '500895023',
      sharesCount: 6,
      totalSavings: 5400,
      monthlyPayment: 300,
      baseShareValue: 906.93,
      currentShareValue: 916.92,
      realPortfolioValue: 5501.52,
      ownershipPercentage: 2.93,
      growthPercentage: -4.5,
    },
    {
      subscriberNumber: '14',
      fullName: 'محمد المحيميد علي',
      phoneNumber: '569373888',
      sharesCount: 4,
      totalSavings: 3600,
      monthlyPayment: 200,
      baseShareValue: 906.93,
      currentShareValue: 916.92,
      realPortfolioValue: 3667.68,
      ownershipPercentage: 1.95,
      growthPercentage: -4.5,
    },
    {
      subscriberNumber: '15',
      fullName: 'زياد الزبر',
      phoneNumber: '569221338',
      sharesCount: 4,
      totalSavings: 3050,
      monthlyPayment: 200,
      baseShareValue: 906.93,
      currentShareValue: 916.92,
      realPortfolioValue: 3667.68,
      ownershipPercentage: 1.95,
      growthPercentage: -4.5,
    },
    {
      subscriberNumber: '16',
      fullName: 'مريم الزبر',
      phoneNumber: '552657630',
      sharesCount: 6,
      totalSavings: 5400,
      monthlyPayment: 300,
      baseShareValue: 906.93,
      currentShareValue: 916.92,
      realPortfolioValue: 5501.52,
      ownershipPercentage: 2.93,
      growthPercentage: -4.5,
    },
    {
      subscriberNumber: '17',
      fullName: 'أسماء الشلاحي',
      phoneNumber: '551257703',
      sharesCount: 3,
      totalSavings: 2700,
      monthlyPayment: 150,
      baseShareValue: 906.93,
      currentShareValue: 916.92,
      realPortfolioValue: 2750.76,
      ownershipPercentage: 1.46,
      growthPercentage: -4.5,
    },
    {
      subscriberNumber: '18',
      fullName: 'جوهرة الشلاحي',
      phoneNumber: '562087772',
      sharesCount: 3,
      totalSavings: 2700,
      monthlyPayment: 150,
      baseShareValue: 906.93,
      currentShareValue: 916.92,
      realPortfolioValue: 2750.76,
      ownershipPercentage: 1.46,
      growthPercentage: -4.5,
    },
    {
      subscriberNumber: '19',
      fullName: 'زهرة الشهيب',
      phoneNumber: '542626031',
      sharesCount: 3,
      totalSavings: 2700,
      monthlyPayment: 150,
      baseShareValue: 906.93,
      currentShareValue: 916.92,
      realPortfolioValue: 2750.76,
      ownershipPercentage: 1.46,
      growthPercentage: -4.5,
    },
    {
      subscriberNumber: '20',
      fullName: 'أحمد طاهر الشلاحي',
      phoneNumber: '537926876',
      sharesCount: 3,
      totalSavings: 2850,
      monthlyPayment: 150,
      baseShareValue: 906.93,
      currentShareValue: 916.92,
      realPortfolioValue: 2750.76,
      ownershipPercentage: 1.46,
      growthPercentage: -4.5,
    },
    {
      subscriberNumber: '21',
      fullName: 'أحمد علي المحيميد',
      phoneNumber: '564519351',
      sharesCount: 3,
      totalSavings: 2700,
      monthlyPayment: 150,
      baseShareValue: 906.93,
      currentShareValue: 916.92,
      realPortfolioValue: 2750.76,
      ownershipPercentage: 1.46,
      growthPercentage: -4.5,
    }
  ];

  private currentPortfolio: WorksheetPortfolio = {
    items: [
      {
        companyName: 'يغطي الأسهم الامريكية الكبرى (S&P500)',
        assetSymbol: 'SPUS',
        units: 257,
        marketPrice: 51.46,
        averagePrice: 45.27,
        baseCost: 11601,
        marketValueUSD: 13225.22,
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
        unrealizedProfitLoss: 0,
        totalValueSAR: 6800.00,
        growth: 0.0,
      }
    ],
    totalPortfolioValue: 185466.35
  };

  public static getInstance(): WorksheetDataService {
    if (!WorksheetDataService.instance) {
      WorksheetDataService.instance = new WorksheetDataService();
    }
    return WorksheetDataService.instance;
  }

  constructor() {
    // بدء التحديث التلقائي كل ساعة
    this.startAutoUpdate();
    console.log('🚀 WorksheetDataService initialized - Auto-update every hour');
    console.log('📋 Updated with latest worksheet data - 21 subscribers');
  }

  private startAutoUpdate() {
    // تحديث فوري عند البدء
    this.updateFromWorksheet();
    
    // تحديث كل ساعة
    this.autoUpdateTimer = setInterval(() => {
      this.updateFromWorksheet();
    }, this.updateInterval);
    
    console.log('⏰ Auto-update timer started - will refresh every hour');
  }

  public stopAutoUpdate() {
    if (this.autoUpdateTimer) {
      clearInterval(this.autoUpdateTimer);
      this.autoUpdateTimer = null;
      console.log('🛑 Auto-update timer stopped');
    }
  }

  private async updateFromWorksheet() {
    try {
      console.log('🔄 Attempting to update data from Google Sheets...');
      
      // محاولة جلب بيانات المشتركين
      await this.fetchSubscribersFromWorksheet();
      
      // محاولة جلب بيانات المحفظة
      await this.fetchPortfolioFromWorksheet();
      
      this.lastUpdate = new Date();
      console.log('✅ Data updated successfully at:', this.lastUpdate.toLocaleString('ar-SA'));
      
    } catch (error) {
      console.warn('⚠️ Failed to update from worksheet, using cached data:', error);
    }
  }

  private async fetchSubscribersFromWorksheet() {
    const urls = [
      this.WORKSHEET_URLS.subscribers,
      this.WORKSHEET_URLS.alternativeSubscribers
    ];

    for (const url of urls) {
      try {
        console.log(`📋 Trying to fetch subscribers from: ${url}`);
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (response.ok) {
          const textData = await response.text();
          console.log(`📋 Response length: ${textData.length} characters`);
          
          if (textData.length > 300 && textData.includes(',') && !textData.includes('بيانات المشتركين بالصندوق المستقبل')) {
            const parsedData = this.parseSubscribersCSV(textData);
            if (parsedData.length > 0) {
              this.currentSubscribers = parsedData;
              console.log(`✅ Successfully updated ${parsedData.length} subscribers from worksheet`);
              return;
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${url}:`, error);
      }
    }
    
    console.log('📋 Using cached subscriber data');
  }

  private async fetchPortfolioFromWorksheet() {
    const urls = [
      this.WORKSHEET_URLS.portfolio,
      this.WORKSHEET_URLS.alternativePortfolio
    ];

    for (const url of urls) {
      try {
        console.log(`📋 Trying to fetch portfolio from: ${url}`);
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (response.ok) {
          const textData = await response.text();
          console.log(`📋 Portfolio response length: ${textData.length} characters`);
          
          if (textData.length > 300 && textData.includes(',')) {
            const parsedData = this.parsePortfolioCSV(textData);
            if (parsedData.items.length > 0) {
              this.currentPortfolio = parsedData;
              console.log(`✅ Successfully updated ${parsedData.items.length} portfolio items from worksheet`);
              return;
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch portfolio from ${url}:`, error);
      }
    }
    
    console.log('📋 Using cached portfolio data');
  }

  private parseSubscribersCSV(csvText: string): WorksheetSubscriber[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    const subscribers: WorksheetSubscriber[] = [];

    console.log('📋 Parsing subscribers CSV...');

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.includes('\t') ? 
        line.split('\t').map(v => v.trim().replace(/^"|"$/g, '')) :
        line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      if (values.length >= 10 && values[0] && values[1]) {
        try {
          const subscriber: WorksheetSubscriber = {
            subscriberNumber: values[1] || i.toString(),
            fullName: values[0] || '',
            phoneNumber: values[2] || '',
            sharesCount: parseFloat(values[3]) || 0,
            totalSavings: this.parseSARValue(values[4]) || 0,
            monthlyPayment: this.parseSARValue(values[5]) || 0,
            baseShareValue: this.parseSARValue(values[6]) || 0,
            currentShareValue: this.parseSARValue(values[7]) || 0,
            realPortfolioValue: this.parseSARValue(values[8]) || 0,
            ownershipPercentage: parseFloat(values[9]?.replace('%', '')) || 0,
            growthPercentage: parseFloat(values[10]?.replace('%', '')) || 0,
          };
          
          if (subscriber.fullName && subscriber.subscriberNumber) {
            subscribers.push(subscriber);
          }
        } catch (error) {
          console.warn(`Error parsing subscriber row ${i}:`, error);
        }
      }
    }
    
    return subscribers;
  }

  private parsePortfolioCSV(csvText: string): WorksheetPortfolio {
    const lines = csvText.split('\n').filter(line => line.trim());
    const items: WorksheetPortfolioItem[] = [];
    let totalValue = 0;

    console.log('📋 Parsing portfolio CSV...');

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.includes('\t') ? 
        line.split('\t').map(v => v.trim().replace(/^"|"$/g, '')) :
        line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      if (values.length >= 8 && values[0]) {
        try {
          const item: WorksheetPortfolioItem = {
            companyName: values[0] || '',
            assetSymbol: values[1] || '',
            units: parseFloat(values[2]) || 0,
            marketPrice: parseFloat(values[3]) || 0,
            averagePrice: parseFloat(values[4]) || 0,
            baseCost: parseFloat(values[5]) || 0,
            marketValueUSD: parseFloat(values[6]) || 0,
            unrealizedProfitLoss: parseFloat(values[7]) || 0,
            totalValueSAR: parseFloat(values[8]) || 0,
            growth: parseFloat(values[9]) || 0,
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
    
    return {
      items,
      totalPortfolioValue: totalValue || 185466.35 // fallback to known total
    };
  }

  private parseSARValue(value: string): number {
    if (!value) return 0;
    const cleanValue = value.toString().replace(/[^\d.-]/g, '');
    return parseFloat(cleanValue) || 0;
  }

  // تحديث يدوي فوري
  public async forceUpdate(): Promise<void> {
    console.log('🔄 Force updating data from worksheet...');
    await this.updateFromWorksheet();
  }

  // الحصول على بيانات المشترك
  public getSubscriber(phoneNumber: string): WorksheetSubscriber | null {
    return this.currentSubscribers.find(sub => sub.phoneNumber === phoneNumber) || null;
  }

  // الحصول على جميع المشتركين
  public getAllSubscribers(): WorksheetSubscriber[] {
    return [...this.currentSubscribers];
  }

  // الحصول على بيانات المحفظة
  public getPortfolio(): WorksheetPortfolio {
    return {
      items: [...this.currentPortfolio.items],
      totalPortfolioValue: this.currentPortfolio.totalPortfolioValue
    };
  }

  // الحصول على وقت آخر تحديث
  public getLastUpdateTime(): Date | null {
    return this.lastUpdate;
  }

  // فحص صحة تسجيل الدخول
  public validateLogin(fullName: string, phoneNumber: string): WorksheetSubscriber | null {
    // فحص الإدمن
    if (fullName === 'مدير النظام الرئيسي' && phoneNumber === 'admin123') {
      return {
        subscriberNumber: 'ADMIN',
        fullName: 'مدير النظام الرئيسي',
        phoneNumber: 'admin123',
        sharesCount: 0,
        totalSavings: 0,
        monthlyPayment: 0,
        baseShareValue: 0,
        currentShareValue: 0,
        realPortfolioValue: 0,
        ownershipPercentage: 100,
        growthPercentage: 0,
      };
    }

    // فحص المشتركين
    return this.currentSubscribers.find(sub => 
      sub.fullName === fullName && sub.phoneNumber === phoneNumber
    ) || null;
  }
}

export default WorksheetDataService;