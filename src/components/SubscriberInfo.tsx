import React, { useState } from 'react';
import { Subscriber } from '../types';
import { api } from '../api';
import { 
  Hash,
  Activity,
  DollarSign,
  User,
  PiggyBank,
  CreditCard,
  Wallet,
  TrendingUp,
  Percent,
  Camera,
  X
} from 'lucide-react';

interface SubscriberInfoProps {
  subscriber: Subscriber;
}

export const SubscriberInfo: React.FC<SubscriberInfoProps> = ({ subscriber }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateImage = async () => {
    if (!imageUrl) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.updateProfileImage(token, imageUrl);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      alert('فشل تحديث الصورة');
    } finally {
      setLoading(false);
      setShowImageModal(false);
    }
  };

  const stats = [
    { label: 'رقم المشترك', value: subscriber.subscriberNumber, icon: Hash, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'عدد الأسهم', value: subscriber.sharesCount.toLocaleString(), icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'إجمالي المدخرات', value: `${subscriber.totalSavings.toLocaleString()} ر.س`, icon: PiggyBank, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'الدفعة الشهرية', value: `${subscriber.monthlyPayment.toLocaleString()} ر.س`, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'قيمة سهم الأساس', value: `${subscriber.baseShareValue} ر.س`, icon: Wallet, color: 'text-gray-600', bg: 'bg-gray-100' },
    { label: 'قيمة السهم الحالي', value: `${subscriber.currentShareValue} ر.س`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'القيمة الحقيقية للمحفظة', value: `${subscriber.realPortfolioValue.toLocaleString()} ر.س`, icon: DollarSign, color: 'text-teal-600', bg: 'bg-teal-100' },
    { label: 'نسبة التملك في الصندوق', value: `${subscriber.ownershipPercentage}%`, icon: Percent, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { label: 'نسبة النمو للمحفظة', value: `${subscriber.growthPercentage}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">بيانات المشترك</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex items-center p-4 rounded-lg border border-gray-50 bg-gray-50 relative group">
          <div className="relative">
            <img 
              src={subscriber.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(subscriber.fullName)}`} 
              alt={subscriber.fullName}
              className="h-16 w-16 rounded-full object-cover ml-4 border-2 border-white shadow-sm"
            />
            <button 
              onClick={() => setShowImageModal(true)}
              className="absolute bottom-0 right-4 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
              title="تغيير الصورة"
            >
              <Camera className="h-3 w-3 text-gray-600" />
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">اسم المشترك</p>
            <p className="text-lg font-bold text-gray-900">{subscriber.fullName}</p>
          </div>
        </div>

        {stats.map((stat, index) => (
          <div key={index} className="flex items-center p-4 rounded-lg border border-gray-50 hover:bg-gray-50 transition-colors">
            <div className={`h-12 w-12 rounded-lg ${stat.bg} flex items-center justify-center ml-4`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">تغيير الصورة الشخصية</h3>
              <button onClick={() => setShowImageModal(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رابط الصورة (URL)</label>
                <input 
                  type="text" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
                <p className="text-xs text-gray-500 mt-1">يمكنك استخدام رابط مباشر لأي صورة على الإنترنت.</p>
              </div>
              <button 
                onClick={handleUpdateImage}
                disabled={loading}
                className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'جاري التحديث...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
