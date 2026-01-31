// API URL for staging environment (updated v3)
const API_URL = 'https://staging--fxugj5spc8ghki7u3abz.youbase.cloud';

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
    const res = await fetch(`${API_URL}/api/public/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, phoneNumber }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }
    return res.json();
  },

  async getUserData(token: string) {
    const res = await fetch(`${API_URL}/api/public/user/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch user data');
    return res.json();
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
    // For now, always return sample data to ensure it displays immediately
    console.log('📋 Using sample subscribers data (Google Sheets integration temporarily disabled)');
    return this.getSampleSubscribersData();
  },

  getSampleSubscribersData() {
    return [
      {
        subscriberNumber: '1',
        fullName: 'محمد عبد القادر',
        phoneNumber: '534000223',
        sharesCount: 40,
        totalSavings: 168300,
        monthlyPayment: 2000,
        baseShareValue: 900,
        currentShareValue: 943.56,
        realPortfolioValue: 37742.22,
        ownershipPercentage: 4.9,
        growthPercentage: 19.70,
        totalIncome: 37742.22,
      },
      {
        subscriberNumber: '2',
        fullName: 'خالد الحربي',
        phoneNumber: '504906091',
        sharesCount: 24,
        totalSavings: 62647.73,
        monthlyPayment: 1200,
        baseShareValue: 900,
        currentShareValue: 943.56,
        realPortfolioValue: 22647.73,
        ownershipPercentage: 4.9,
        growthPercentage: 11.82,
        totalIncome: 22647.73,
      },
      {
        subscriberNumber: '3',
        fullName: 'سعد عبد الله',
        phoneNumber: '545473331',
        sharesCount: 5,
        totalSavings: 14718.26,
        monthlyPayment: 1000,
        baseShareValue: 900,
        currentShareValue: 943.56,
        realPortfolioValue: 4718.26,
        ownershipPercentage: 4.9,
        growthPercentage: 9.86,
        totalIncome: 4718.26,
      }
    ];
  },

  async getPortfolio() {
    console.log('📋 Loading portfolio data...');
    
    // البيانات الفعلية من الورك شيت - الورقة الثانية
    const portfolioData = {
      items: [
        {
          companyName: 'يغطي الأسهم الامريكية الكبرى (S&P500)',
          assetSymbol: 'SPUS',
          units: 257,
          marketPrice: 52.19,
          averagePrice: 48.50,
          baseCost: 12464.50,
          marketValueUSD: 13412.83,
          totalValueUSD: 13412.83,
          unrealizedProfitLoss: 948.33,
          totalValueSAR: 50298.11,
          growth: 7.6,
        },
        {
          companyName: 'يغطي قطاع التكنلوجيا العالمي (بمافيه أمريكيا)',
          assetSymbol: 'SPTE',
          units: 109,
          marketPrice: 38.13,
          averagePrice: 34.20,
          baseCost: 3727.80,
          marketValueUSD: 4156.17,
          totalValueUSD: 4156.17,
          unrealizedProfitLoss: 428.37,
          totalValueSAR: 15585.64,
          growth: 11.5,
        },
        {
          companyName: 'الأسواق المتقدمة والناشئة بإستثناء أمريكا',
          assetSymbol: 'SPWO',
          units: 85,
          marketPrice: 29.31,
          averagePrice: 30.15,
          baseCost: 2562.75,
          marketValueUSD: 2491.35,
          totalValueUSD: 2491.35,
          unrealizedProfitLoss: -71.40,
          totalValueSAR: 9342.56,
          growth: -2.8,
        },
        {
          companyName: 'البيتكوين',
          assetSymbol: 'IBIT',
          units: 41,
          marketPrice: 47.49,
          averagePrice: 42.80,
          baseCost: 1754.80,
          marketValueUSD: 1947.09,
          totalValueUSD: 1947.09,
          unrealizedProfitLoss: 192.29,
          totalValueSAR: 7301.59,
          growth: 11.0,
        },
        {
          companyName: 'ذهب',
          assetSymbol: 'GLDM',
          units: 32,
          marketPrice: 96.01,
          averagePrice: 98.50,
          baseCost: 3152.00,
          marketValueUSD: 3072.32,
          totalValueUSD: 3072.32,
          unrealizedProfitLoss: -79.68,
          totalValueSAR: 11521.20,
          growth: -2.5,
        },
        {
          companyName: 'صكوك',
          assetSymbol: 'SUKUK',
          units: 150,
          marketPrice: 102.50,
          averagePrice: 100.00,
          baseCost: 15000.00,
          marketValueUSD: 15375.00,
          totalValueUSD: 15375.00,
          unrealizedProfitLoss: 375.00,
          totalValueSAR: 57656.25,
          growth: 2.5,
        },
        {
          companyName: 'صندوق معايير للقروض',
          assetSymbol: 'LOAN',
          units: 200,
          marketPrice: 52.75,
          averagePrice: 51.20,
          baseCost: 10240.00,
          marketValueUSD: 10550.00,
          totalValueUSD: 10550.00,
          unrealizedProfitLoss: 310.00,
          totalValueSAR: 39562.50,
          growth: 3.0,
        },
        {
          companyName: 'وديعة بنكية',
          assetSymbol: 'DEPOSIT',
          units: 1,
          marketPrice: 6000.00,
          averagePrice: 6000.00,
          baseCost: 6000.00,
          marketValueUSD: 6000.00,
          totalValueUSD: 6000.00,
          unrealizedProfitLoss: 0.00,
          totalValueSAR: 9880.00,
          growth: 0.0,
        }
      ],
      totalPortfolioValue: 201148.35
    };
    
    console.log('✅ Portfolio loaded - Items:', portfolioData.items.length, 'Total:', portfolioData.totalPortfolioValue);
    return portfolioData;
  }
};