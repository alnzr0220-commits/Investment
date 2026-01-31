import React, { useState } from 'react';
import { Subscriber, PortfolioData } from '../types';
import { FixedSubscriberInfo } from './FixedSubscriberInfo';
import { PortfolioDetails } from './PortfolioDetails';
import { ProfileCard } from './ProfileCard';
import { LogOut } from 'lucide-react';

interface DashboardProps {
  subscriber: Subscriber;
  portfolio: PortfolioData;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ subscriber, portfolio, onLogout }) => {
  const [currentSubscriber, setCurrentSubscriber] = useState(subscriber);

  const handleProfileUpdate = (updatedSubscriber: Subscriber) => {
    setCurrentSubscriber(updatedSubscriber);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-md ml-3">
                <span className="text-white text-xl font-bold">م</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">لوحة التحكم</h1>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <button 
                onClick={onLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل خروج
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Section 1: Subscriber Info with correct data */}
        <section>
          <FixedSubscriberInfo subscriber={currentSubscriber} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section 2: Portfolio Details (Takes 2/3 width on large screens) */}
          <section className="lg:col-span-2">
            <PortfolioDetails data={portfolio} />
          </section>

          {/* Section 3: Profile Card (Takes 1/3 width on large screens) */}
          <section className="lg:col-span-1">
            <ProfileCard 
              subscriber={currentSubscriber} 
              onProfileUpdate={handleProfileUpdate}
            />
          </section>
        </div>
      </main>
    </div>
  );
};
