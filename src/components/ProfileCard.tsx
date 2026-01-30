import React, { useState } from 'react';
import { Subscriber } from '../types';
import { Phone, User, Edit, Key } from 'lucide-react';
import { ChangePassword } from './ChangePassword';

interface ProfileCardProps {
  subscriber: Subscriber;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ subscriber }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handlePasswordChangeSuccess = () => {
    // You can add any additional logic here if needed
    console.log('Password changed successfully');
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">الملف الشخصي</h3>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
            <Edit className="h-4 w-4 ml-1" />
            تعديل
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="h-24 w-24 rounded-full bg-gray-100 overflow-hidden ring-4 ring-white shadow-lg">
              <img src={subscriber.profileImage} alt={subscriber.fullName} className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 h-6 w-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          
          <h4 className="text-xl font-bold text-gray-900 mb-1">{subscriber.fullName}</h4>
          <p className="text-sm text-gray-500 mb-6">{subscriber.subscriberNumber}</p>

          <div className="w-full space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 ml-3" />
                <span className="text-sm text-gray-600">اسم المستخدم</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{subscriber.fullName}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 ml-3" />
                <span className="text-sm text-gray-600">رقم الجوال</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{subscriber.phoneNumber}</span>
            </div>

            {/* Change Password Button */}
            <button
              onClick={() => setShowChangePassword(true)}
              className="w-full flex items-center justify-center p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200"
            >
              <Key className="h-5 w-5 text-indigo-600 ml-2" />
              <span className="text-sm font-medium text-indigo-600">تغيير كلمة المرور</span>
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePassword
          onClose={() => setShowChangePassword(false)}
          onSuccess={handlePasswordChangeSuccess}
        />
      )}
    </>
  );
};
