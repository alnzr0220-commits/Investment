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
  items: [],
  totalPortfolioValue: 0
};
