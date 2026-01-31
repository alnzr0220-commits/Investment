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
    
    // البيانات الثابتة من الورك شيت
    const portfolioData = {
      items: [
        {
          companyName: 'Apple Inc.',
          assetSymbol: 'AAPL',
          units: 100,
          marketPrice: 150.25,
          totalValueUSD: 15025,
          totalValueSAR: 56343.75,
          growth: 5.2,
        },
        {
          companyName: 'Microsoft Corporation',
          assetSymbol: 'MSFT',
          units: 75,
          marketPrice: 280.50,
          totalValueUSD: 21037.5,
          totalValueSAR: 78890.625,
          growth: 3.8,
        },
        {
          companyName: 'Tesla Inc.',
          assetSymbol: 'TSLA',
          units: 50,
          marketPrice: 220.75,
          totalValueUSD: 11037.5,
          totalValueSAR: 41390.625,
          growth: -2.1,
        }
      ],
      totalPortfolioValue: 176625
    };
    
    console.log('✅ Portfolio loaded - Items:', portfolioData.items.length, 'Total:', portfolioData.totalPortfolioValue);
    return portfolioData;
  }
};