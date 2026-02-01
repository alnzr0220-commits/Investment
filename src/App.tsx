import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { SimpleAdminDashboard } from './components/SimpleAdminDashboard';
import { Subscriber, PortfolioData } from './types';
import cleanApi from './api/cleanApi';
import { ArrowRight } from 'lucide-react';

// Wrapper for Admin View of User Dashboard
const AdminUserView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const subscriber = location.state?.subscriber;
  const [portfolio, setPortfolio] = useState<PortfolioData>({ items: [], totalPortfolioValue: 0 });

  useEffect(() => {
    console.log('🔄 Clean App: Loading portfolio data...');
    cleanApi.getPortfolio()
      .then(data => {
        console.log('✅ Clean App: Portfolio data loaded:', data);
        setPortfolio(data);
      })
      .catch(error => {
        console.error('❌ Clean App: Failed to load portfolio:', error);
        // البيانات الاحتياطية
        setPortfolio({ items: [], totalPortfolioValue: 0 });
      });
  }, []);

  if (!subscriber) {
    return <Navigate to="/admin/dashboard" />;
  }

  // Map raw data to Subscriber type
  const mappedSubscriber: Subscriber = {
    id: 'admin-view',
    fullName: subscriber.fullName,
    subscriberNumber: subscriber.subscriberNumber,
    sharesCount: Number(subscriber.sharesCount),
    realPortfolioValue: Number(subscriber.realPortfolioValue),
    totalIncome: Number(subscriber.totalIncome || 0),
    totalSavings: Number(subscriber.totalSavings || 0),
    monthlyPayment: Number(subscriber.monthlyPayment || 0),
    baseShareValue: Number(subscriber.baseShareValue || 0),
    currentShareValue: Number(subscriber.currentShareValue || 0),
    ownershipPercentage: Number(subscriber.ownershipPercentage || 0),
    growthPercentage: Number(subscriber.growthPercentage || 0),
    profileImage: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(subscriber.fullName),
    phoneNumber: subscriber.phoneNumber
  };

  return (
    <div>
      <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center">
          <span className="font-bold text-lg ml-2">وضع المشاهدة (إدمن)</span>
          <span className="text-indigo-200 text-sm">أنت تشاهد حساب: {mappedSubscriber.fullName}</span>
        </div>
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="bg-white text-indigo-600 px-4 py-1 rounded-md text-sm font-bold hover:bg-indigo-50 flex items-center"
        >
          <ArrowRight className="ml-1 h-4 w-4" />
          عودة للإدمن
        </button>
      </div>
      <Dashboard 
        subscriber={mappedSubscriber} 
        portfolio={portfolio} 
        onLogout={() => navigate('/admin/dashboard')} 
      />
    </div>
  );
};

function App() {
  const [user, setUser] = useState<Subscriber | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioData>({ items: [], totalPortfolioValue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch portfolio data
    console.log('🔄 Loading portfolio data...');
    api.getPortfolio()
      .then(data => {
        console.log('✅ Portfolio data loaded:', data);
        setPortfolio(data);
      })
      .catch(error => {
        console.error('❌ Failed to load portfolio:', error);
        // استخدام البيانات الاحتياطية في حالة الفشل
        const backupData = {
          items: [
            {
              companyName: 'يغطي الأسهم الامريكية الكبرى (S&P500)',
              assetSymbol: 'SPUS',
              units: 257,
              marketPrice: 51.46,
              averagePrice: 45.27,
              baseCost: 11601,
              marketValueUSD: 13225.22,
              totalValueUSD: 13225.22,
              unrealizedProfitLoss: 1624.22,
              totalValueSAR: 49594.58,
              growth: 14.0,
            },
            {
              companyName: 'يغطي قطاع التكنلوجيا العالمي (بمافيه أمريكيا)',
              assetSymbol: 'SPTE',
              units: 109,
              marketPrice: 36.73,
              averagePrice: 35.29,
              baseCost: 3836,
              marketValueUSD: 4003.57,
              totalValueUSD: 4003.57,
              unrealizedProfitLoss: 167.57,
              totalValueSAR: 15013.39,
              growth: 4.4,
            },
            {
              companyName: 'الأسواق المتقدمة والناشئة بإستثناء أمريكا',
              assetSymbol: 'SPWO',
              units: 4,
              marketPrice: 29.31,
              averagePrice: 29.87,
              baseCost: 131,
              marketValueUSD: 117.24,
              totalValueUSD: 117.24,
              unrealizedProfitLoss: -13.76,
              totalValueSAR: 439.65,
              growth: -10.5,
            },
            {
              companyName: 'البيتكوين',
              assetSymbol: 'IBIT',
              units: 46,
              marketPrice: 47.49,
              averagePrice: 54.55,
              baseCost: 2534,
              marketValueUSD: 2184.54,
              totalValueUSD: 2184.54,
              unrealizedProfitLoss: -349.46,
              totalValueSAR: 8192.03,
              growth: -13.8,
            },
            {
              companyName: 'ذهب',
              assetSymbol: 'GLDM',
              units: 19,
              marketPrice: 96.01,
              averagePrice: 104.37,
              baseCost: 2000,
              marketValueUSD: 1824.19,
              totalValueUSD: 1824.19,
              unrealizedProfitLoss: -175.81,
              totalValueSAR: 6840.71,
              growth: -8.8,
            },
            {
              companyName: 'صكوك',
              assetSymbol: 'Deeds',
              units: 50,
              marketPrice: 1113.34,
              averagePrice: 1080.00,
              baseCost: 54000,
              marketValueUSD: 55667,
              totalValueUSD: 55667,
              unrealizedProfitLoss: 1667,
              totalValueSAR: 58467.00,
              growth: 3.1,
            },
            {
              companyName: 'صندوق معايير للقروض',
              assetSymbol: 'Loan Fund',
              units: 1,
              marketPrice: 40119.00,
              averagePrice: 38000.00,
              baseCost: 38000,
              marketValueUSD: 40119,
              totalValueUSD: 40119,
              unrealizedProfitLoss: 2119,
              totalValueSAR: 40119.00,
              growth: 5.6,
            },
            {
              companyName: 'وديعة بنكية',
              assetSymbol: 'DEPOSIT',
              units: 1,
              marketPrice: 6800.00,
              averagePrice: 6800.00,
              baseCost: 6800,
              marketValueUSD: 6800,
              totalValueUSD: 6800,
              unrealizedProfitLoss: 0,
              totalValueSAR: 6800.00,
              growth: 0.0,
            }
          ],
          totalPortfolioValue: 185466.35
        };
        console.log('🔄 Using backup portfolio data:', backupData);
        setPortfolio(backupData);
      });

    const token = localStorage.getItem('token');
    if (token) {
      api.getUserData(token)
        .then(userData => {
          setUser({
            id: '1',
            fullName: userData.fullName,
            subscriberNumber: userData.subscriberNumber,
            sharesCount: Number(userData.sharesCount),
            realPortfolioValue: Number(userData.realPortfolioValue),
            totalIncome: Number(userData.totalIncome || 0),
            totalSavings: Number(userData.totalSavings || 0),
            monthlyPayment: Number(userData.monthlyPayment || 0),
            baseShareValue: Number(userData.baseShareValue || 0),
            currentShareValue: Number(userData.currentShareValue || 0),
            ownershipPercentage: Number(userData.ownershipPercentage || 0),
            growthPercentage: Number(userData.growthPercentage || 0),
            profileImage: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.fullName),
            phoneNumber: userData.phoneNumber || ''
          });
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData: any) => {
    console.log('✅ Clean App: Login successful, setting user data');
    setUser({
      id: userData.subscriberNumber,
      fullName: userData.fullName,
      subscriberNumber: userData.subscriberNumber,
      sharesCount: userData.sharesCount,
      realPortfolioValue: userData.realPortfolioValue,
      totalIncome: userData.realPortfolioValue,
      totalSavings: userData.totalSavings,
      monthlyPayment: userData.monthlyPayment,
      baseShareValue: userData.baseShareValue,
      currentShareValue: userData.currentShareValue,
      ownershipPercentage: userData.ownershipPercentage,
      growthPercentage: userData.growthPercentage,
      profileImage: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.fullName),
      phoneNumber: userData.phoneNumber
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  return (
    <Router>
      <div className="font-cairo text-right" dir="rtl">
        <Routes>
          {/* User Routes */}
          <Route path="/" element={
            user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />
          } />
          
          <Route path="/dashboard" element={
            user ? (
              <Dashboard 
                subscriber={user} 
                portfolio={portfolio} 
                onLogout={handleLogout} 
              />
            ) : (
              <Navigate to="/" />
            )
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={<SimpleAdminDashboard />} />
          <Route path="/admin/login" element={<SimpleAdminDashboard />} />
          <Route path="/admin/dashboard" element={<SimpleAdminDashboard />} />
          <Route path="/admin/view/:id" element={<AdminUserView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
