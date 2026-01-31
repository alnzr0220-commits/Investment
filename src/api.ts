// API URL for staging environment (updated v3)
const API_URL = 'https://staging--fxugj5spc8ghki7u3abz.youbase.cloud';

// Google Sheets CSV URLs
const MAIN_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pub?output=csv';
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
      // Try main sheet first
      const mainResponse = await fetch(MAIN_SHEET_URL);
      if (mainResponse.ok) {
        const csvText = await mainResponse.text();
        const result = this.parseCSVToSubscribers(csvText);
        if (result.length > 0) {
          return result;
        }
      }
      
      // Try specific subscribers sheet
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
      // Try main sheet first
      const mainResponse = await fetch(MAIN_SHEET_URL);
      if (mainResponse.ok) {
        const csvText = await mainResponse.text();
        const result = this.parseCSVToPortfolio(csvText);
        if (result.items.length > 0) {
          return result;
        }
      }
      
      // Try specific portfolio sheet
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

    console.log('Raw CSV data for subscribers:', csvText.substring(0, 500)); // Log first 500 chars for debugging

    // Skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      // Check if this looks like subscriber data (has phone numbers or subscriber IDs)
      if (values.length >= 10 && values[0] && !values[0].toLowerCase().includes('بيانات')) {
        const subscriber = {
          phoneNumber: values[0] || '', // رقم المرور
          fullName: values[1] || '', // اسم المشترك
          subscriberNumber: values[2] || '', // رقم المشترك
          sharesCount: parseFloat(values[3]) || 0, // عدد الاسهم
          totalSavings: this.parseSARValue(values[4]) || 0, // إجمالي مدخراتك
          monthlyPayment: this.parseSARValue(values[5]) || 0, // دفعة شهرية (ريال)
          baseShareValue: this.parseSARValue(values[6]) || 0, // قيمة سهم الاساس
          currentShareValue: this.parseSARValue(values[7]) || 0, // قيمة سهم الحالي
          realPortfolioValue: this.parseSARValue(values[8]) || 0, // القيمة الحقيقة لمحفظتك
          ownershipPercentage: parseFloat(values[9]) || 0, // نسبة تملك في صندوق
          growthPercentage: parseFloat(values[10]) || 0, // نسبة النمو المحفظة
          totalIncome: this.parseSARValue(values[8]) || 0, // استخدام القيمة الحقيقية كدخل إجمالي
        };
        subscribers.push(subscriber);
      }
    }
    
    console.log(`Subscribers data loaded: ${subscribers.length} subscribers found`);
    return subscribers;
  },

  parseCSVToPortfolio(csvText: string) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const items = [];
    let totalValue = 0;

    console.log('Raw CSV data:', csvText.substring(0, 500)); // Log first 500 chars for debugging

    // Skip header row (index 0) and check if we have actual data
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      // Check if this looks like portfolio data (has SAR values)
      if (values.length >= 6 && values[0] && values[0].includes('SAR')) {
        // Portfolio data format: اسم الصندوق، الرمز، عدد الوحدات، سعر السوق، إجمالي القيمة بالدولار، إجمالي القيمة بالريال
        const item = {
          companyName: values[5] || values[0] || '', // اسم الصندوق (column 6 or fallback to first)
          assetSymbol: values[4] || '', // الرمز
          units: parseFloat(values[3]) || 0, // عدد الوحدات
          marketPrice: parseFloat(values[2]) || 0, // سعر السوق
          totalValueUSD: this.parseSARValue(values[1]) / 3.75 || 0, // Convert SAR to USD
          totalValueSAR: this.parseSARValue(values[0]) || 0, // إجمالي القيمة بالريال
          growth: Math.random() * 10 - 5, // Random growth for now
        };
        
        // Only add if we have meaningful data
        if (item.totalValueSAR > 0 || item.units > 0) {
          items.push(item);
          totalValue += item.totalValueSAR;
        }
      }
    }

    console.log(`Portfolio data loaded: ${items.length} items found, total value: ${totalValue}`);
    
    return {
      items,
      totalPortfolioValue: totalValue
    };
  },

  parseSARValue(value: string): number {
    if (!value) return 0;
    // Remove SAR prefix and parse number
    const cleanValue = value.replace(/SAR|,/g, '').trim();
    return parseFloat(cleanValue) || 0;
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
