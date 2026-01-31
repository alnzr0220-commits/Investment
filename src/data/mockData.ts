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
      companyName: 'صندوق الأسهم السعودية المتنوع',
      assetSymbol: 'SAEF-001',
      units: 1500,
      marketPrice: 42.75,
      totalValueUSD: 17100,
      totalValueSAR: 64125,
      growth: 8.2
    },
    {
      companyName: 'صندوق الأسواق الناشئة',
      assetSymbol: 'EMEF-002',
      units: 1200,
      marketPrice: 28.50,
      totalValueUSD: 9120,
      totalValueSAR: 34200,
      growth: -1.8
    },
    {
      companyName: 'صندوق التكنولوجيا والابتكار',
      assetSymbol: 'TECH-003',
      units: 800,
      marketPrice: 65.25,
      totalValueUSD: 13920,
      totalValueSAR: 52200,
      growth: 15.3
    },
    {
      companyName: 'صندوق الطاقة المتجددة',
      assetSymbol: 'RENEW-004',
      units: 600,
      marketPrice: 38.90,
      totalValueUSD: 6224,
      totalValueSAR: 23340,
      growth: 6.7
    },
    {
      companyName: 'صندوق الرعاية الصحية',
      assetSymbol: 'HEALTH-005',
      units: 900,
      marketPrice: 31.80,
      totalValueUSD: 7632,
      totalValueSAR: 28620,
      growth: 4.1
    }
  ],
  totalPortfolioValue: 202485
};
