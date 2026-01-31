import { Subscriber, PortfolioData } from '../types';

// Mock data will be replaced by Google Sheets fetch
export const mockSubscriber: Subscriber = {
  id: '1',
  fullName: 'أحمد محمد علي العتيبي', // 4 parts
  subscriberNumber: 'SUB-2024-001',
  sharesCount: 1500,
  totalIncome: 75000,
  totalSavings: 120000,
  monthlyPayment: 5000,
  baseShareValue: 100,
  currentShareValue: 145,
  realPortfolioValue: 217500,
  ownershipPercentage: 2.5,
  growthPercentage: 45,
  profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  phoneNumber: '0501234567'
};

export const mockPortfolio: PortfolioData = {
  items: [
    {
      companyName: 'صندوق الأسهم السعودية',
      assetSymbol: 'SAEF',
      units: 1200,
      marketPrice: 45.50,
      totalValueUSD: 14560,
      totalValueSAR: 54600,
      growth: 8.5
    },
    {
      companyName: 'صندوق الأسواق الناشئة',
      assetSymbol: 'EMEF',
      units: 800,
      marketPrice: 32.75,
      totalValueUSD: 6986,
      totalValueSAR: 26200,
      growth: -2.3
    },
    {
      companyName: 'صندوق التكنولوجيا',
      assetSymbol: 'TECH',
      units: 600,
      marketPrice: 78.90,
      totalValueUSD: 12616,
      totalValueSAR: 47340,
      growth: 12.7
    },
    {
      companyName: 'صندوق الطاقة المتجددة',
      assetSymbol: 'RENEW',
      units: 400,
      marketPrice: 55.25,
      totalValueUSD: 5893,
      totalValueSAR: 22100,
      growth: 5.2
    }
  ],
  totalPortfolioValue: 150240
};
