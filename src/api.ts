// API URL for staging environment (updated v3)
const API_URL = 'https://staging--fxugj5spc8ghki7u3abz.youbase.cloud';

// Google Sheets CSV URL
const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pub?output=csv';

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
    try {
      // First try to get from Google Sheets
      const response = await fetch(GOOGLE_SHEETS_CSV_URL);
      if (response.ok) {
        const csvText = await response.text();
        return this.parseCSVToSubscribers(csvText);
      }
    } catch (error) {
      console.warn('Failed to fetch from Google Sheets, falling back to API:', error);
    }
    
    // Fallback to API
    const res = await fetch(`${API_URL}/api/public/admin/subscribers`);
    if (!res.ok) throw new Error('Failed to fetch subscribers');
    return res.json();
  },

  async getPortfolio() {
    try {
      // First try to get from Google Sheets
      const response = await fetch(GOOGLE_SHEETS_CSV_URL);
      if (response.ok) {
        const csvText = await response.text();
        return this.parseCSVToPortfolio(csvText);
      }
    } catch (error) {
      console.warn('Failed to fetch portfolio from Google Sheets, falling back to API:', error);
    }
    
    // Fallback to API
    const res = await fetch(`${API_URL}/api/public/portfolio`);
    if (!res.ok) throw new Error('Failed to fetch portfolio');
    return res.json();
  },

  parseCSVToSubscribers(csvText: string) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const subscribers = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= headers.length && values[0]) {
        const subscriber = {
          fullName: values[0] || '',
          subscriberNumber: values[1] || '',
          phoneNumber: values[2] || '',
          sharesCount: parseFloat(values[3]) || 0,
          realPortfolioValue: parseFloat(values[4]) || 0,
          totalIncome: parseFloat(values[5]) || 0,
          totalSavings: parseFloat(values[6]) || 0,
          monthlyPayment: parseFloat(values[7]) || 0,
          baseShareValue: parseFloat(values[8]) || 0,
          currentShareValue: parseFloat(values[9]) || 0,
          ownershipPercentage: parseFloat(values[10]) || 0,
          growthPercentage: parseFloat(values[11]) || 0,
        };
        subscribers.push(subscriber);
      }
    }
    return subscribers;
  },

  parseCSVToPortfolio(csvText: string) {
    const lines = csvText.split('\n');
    const items = [];
    let totalValue = 0;

    // Skip header and process portfolio data (assuming it starts from a specific row)
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 6 && values[0] && values[0] !== 'Portfolio') {
        const item = {
          companyName: values[0] || '',
          assetSymbol: values[1] || '',
          units: parseFloat(values[2]) || 0,
          marketPrice: parseFloat(values[3]) || 0,
          totalValueUSD: parseFloat(values[4]) || 0,
          totalValueSAR: parseFloat(values[5]) || 0,
          growth: parseFloat(values[6]) || 0,
        };
        items.push(item);
        totalValue += item.totalValueSAR;
      }
    }

    return {
      items,
      totalPortfolioValue: totalValue
    };
  },

  async updateProfileImage(token: string, imageUrl: string) {
    const res = await fetch(`${API_URL}/api/public/user/profile-image`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ imageUrl }),
    });
    if (!res.ok) throw new Error('Failed to update profile image');
    return res.json();
  },

  async changePassword(token: string, currentPassword: string, newPassword: string) {
    const res = await fetch(`${API_URL}/api/public/user/change-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to change password');
    }
    return res.json();
  }
};
