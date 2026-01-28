export interface Subscriber {
  id: string;
  fullName: string;
  subscriberNumber: string;
  sharesCount: number;
  totalIncome: number;
  totalSavings: number;
  monthlyPayment: number;
  baseShareValue: number;
  currentShareValue: number;
  realPortfolioValue: number;
  ownershipPercentage: number;
  growthPercentage: number;
  profileImage: string;
  phoneNumber: string;
}

export interface PortfolioItem {
  companyName: string;
  assetSymbol: string;
  units: number;
  marketPrice: number;
  totalValueUSD: number;
  totalValueSAR: number;
  growth?: number;
}

export interface PortfolioData {
  items: PortfolioItem[];
  totalPortfolioValue: number;
}
