// API URL for staging environment (updated v3)
const API_URL = 'https://staging--fxugj5spc8ghki7u3abz.youbase.cloud';

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
    const res = await fetch(`${API_URL}/api/public/admin/subscribers`);
    if (!res.ok) throw new Error('Failed to fetch subscribers');
    return res.json();
  },

  async getPortfolio() {
    const res = await fetch(`${API_URL}/api/public/portfolio`);
    if (!res.ok) throw new Error('Failed to fetch portfolio');
    return res.json();
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
  }
};
