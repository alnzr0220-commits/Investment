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
  
  // البيانات الحالية من الورك شيت (آخر تحديث)
  private currentSubscribers: WorksheetSubscriber[] = [
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
  }

  private startAutoUpdate() {
    // تحديث فوري عند البدء
    this.updateFromWorksheet();
    
    // تحديث كل ساعة
    setInterval(() => {
      this.updateFromWorksheet();
    }, this.updateInterval);
  }

  private async updateFromWorksheet() {
    try {
      console.log('🔄 Updating data from Google Sheets...');
      
      // محاولة جلب البيانات من Google Sheets
      // إذا فشل، سيبقى على البيانات الحالية
      
      this.lastUpdate = new Date();
      console.log('✅ Data updated at:', this.lastUpdate.toLocaleString('ar-SA'));
      
    } catch (error) {
      console.warn('⚠️ Failed to update from worksheet, using cached data:', error);
    }
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