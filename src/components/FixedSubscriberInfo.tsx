import React from 'react';
import { Hash, Activity, PiggyBank, CreditCard, Wallet, TrendingUp, DollarSign, Percent } from 'lucide-react';

export const FixedSubscriberInfo: React.FC = () => {
  // البيانات الثابتة الصحيحة لجعفر طاهر الزبر من الورك شيت
  const subscriberData = {
    subscriberNumber: '1',
    fullName: 'جعفر طاهر الزبر',
    phoneNumber: '534000223',
    sharesCount: 42,
    totalSavings: 38100,
    monthlyPayment: 2100,
    baseShareValue: 900,
    currentShareValue: 950,
    realPortfolioValue: 38090.89,
    ownershipPercentage: 20.49,
    growthPercentage: 4.5,
  };

  const infoItems = [
    { label: 'اسم المشترك', value: subscriberData.fullName, icon: Hash, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'رقم المشترك', value: subscriberData.subscriberNumber, icon: Hash, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'عدد الأسهم', value: subscriberData.sharesCount.toLocaleString(), icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'إجمالي المدخرات', value: `${subscriberData.totalSavings.toLocaleString()} ر.س`, icon: PiggyBank, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'الدفعة الشهرية', value: `${subscriberData.monthlyPayment.toLocaleString()} ر.س`, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'قيمة سهم الأساس', value: `${subscriberData.baseShareValue} ر.س`, icon: Wallet, color: 'text-gray-600', bg: 'bg-gray-100' },
    { label: 'قيمة السهم الحالي', value: `${subscriberData.currentShareValue} ر.س`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'القيمة الحقيقية للمحفظة', value: `${subscriberData.realPortfolioValue.toLocaleString()} ر.س`, icon: DollarSign, color: 'text-teal-600', bg: 'bg-teal-100' },
    { label: 'نسبة التملك في الصندوق', value: `${subscriberData.ownershipPercentage}%`, icon: Percent, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { label: 'نسبة النمو للمحفظة', value: `${subscriberData.growthPercentage}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">بيانات المشترك</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {infoItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${item.bg}`}>
                  <IconComponent className={`h-5 w-5 ${item.color}`} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{item.label}</p>
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};