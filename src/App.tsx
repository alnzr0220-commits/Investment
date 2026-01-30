import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { SimpleAdminDashboard } from './components/SimpleAdminDashboard';
import { mockPortfolio } from './data/mockData';
import { Subscriber, PortfolioData } from './types';
import { api } from './api';
import { ArrowRight } from 'lucide-react';

// Wrapper for Admin View of User Dashboard
const AdminUserView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const subscriber = location.state?.subscriber;
  const [portfolio, setPortfolio] = useState<PortfolioData>(mockPortfolio);

  useEffect(() => {
    api.getPortfolio().then(data => setPortfolio(data)).catch(console.error);
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
  const [portfolio, setPortfolio] = useState<PortfolioData>(mockPortfolio);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch portfolio data
    api.getPortfolio().then(data => setPortfolio(data)).catch(console.error);

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
