// API URL for staging environment (updated v3)
const API_URL = 'https://staging--fxugj5spc8ghki7u3abz.youbase.cloud';

// Google Sheets CSV URLs
const SUBSCRIBERS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pub?gid=0&single=true&output=csv';
const PORTFOLIO_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pub?gid=1614954373&single=true&output=csv';

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
      // Get from Google Sheets (Subscribers sheet)
      const response = await fetch(SUBSCRIBERS_SHEET_URL);
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
      // Get from Google Sheets (Portfolio sheet)
      const response = await fetch(PORTFOLIO_SHEET_URL);
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
    const lines = csvText.split('\n').filter(line => line.trim());
    const subscribers = [];

    // Skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length >= 11 && values[0]) {
        const subscriber = {
          phoneNumber: values[0] || '', // رقم المرور
          fullName: values[1] || '', // اسم المشترك
          subscriberNumber: values[2] || '', // رقم المشترك
          sharesCount: parseFloat(values[3]) || 0, // عدد الاسهم
          totalSavings: parseFloat(values[4]) || 0, // إجمالي مدخراتك
          monthlyPayment: parseFloat(values[5]) || 0, // دفعة شهرية (ريال)
          baseShareValue: parseFloat(values[6]) || 0, // قيمة سهم الاساس
          currentShareValue: parseFloat(values[7]) || 0, // قيمة سهم الحالي
          realPortfolioValue: parseFloat(values[8]) || 0, // القيمة الحقيقة لمحفظتك
          ownershipPercentage: parseFloat(values[9]) || 0, // نسبة تملك في صندوق
          growthPercentage: parseFloat(values[10]) || 0, // نسبة النمو المحفظة
          totalIncome: parseFloat(values[8]) || 0, // استخدام القيمة الحقيقية كدخل إجمالي
        };
        subscribers.push(subscriber);
      }
    }
    return subscribers;
  },

  parseCSVToPortfolio(csvText: string) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const items = [];
    let totalValue = 0;

    // Skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length >= 7 && values[0]) {
        const item = {
          companyName: values[0] || '', // اسم الصندوق
          assetSymbol: values[1] || '', // الرمز
          units: parseFloat(values[2]) || 0, // عدد الوحدات (عددالاسهم)
          marketPrice: parseFloat(values[3]) || 0, // سعر السوق
          totalValueUSD: parseFloat(values[4]) || 0, // إجمالي القيمة بالدولار
          totalValueSAR: parseFloat(values[5]) || 0, // إجمالي القيمة بالريال
          growth: parseFloat(values[6]) || 0, // يمكن إضافة نمو إذا كان متوفر
        };
        items.push(item);
        totalValue += item.totalValueSAR;
      }
    }

    // إذا كان هناك إجمالي في آخر صف
    const lastLine = lines[lines.length - 1];
    if (lastLine && lastLine.includes('إجمالي')) {
      const lastValues = lastLine.split(',').map(v => v.trim().replace(/"/g, ''));
      const totalFromSheet = parseFloat(lastValues[lastValues.length - 1]);
      if (totalFromSheet > 0) {
        totalValue = totalFromSheet;
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

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_URL}/api/public/upload/image`, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) throw new Error('Failed to upload image');
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
