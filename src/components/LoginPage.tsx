import React, { useState } from 'react';
import { Phone, User, Lock, ArrowRight, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

interface LoginPageProps {
  onLogin: (userData: any) => void;
}

// Admin credentials
const ADMIN_CREDENTIALS = {
  fullName: 'مدير النظام الرئيسي',
  phoneNumber: 'admin123'
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const navigate = useNavigate();

  // Check if current input matches admin credentials
  const checkAdminMode = (name: string, phone: string) => {
    const isAdmin = name.trim() === ADMIN_CREDENTIALS.fullName && phone.trim() === ADMIN_CREDENTIALS.phoneNumber;
    setIsAdminMode(isAdmin);
    return isAdmin;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check if admin login first (before any validation)
    if (checkAdminMode(fullName, phoneNumber)) {
      // Admin login - تحسين الأداء
      setLoading(true);
      console.log('⚡ Admin login - navigating immediately');
      
      // التنقل فوراً بدون تأخير
      navigate('/admin');
      setLoading(false);
      return;
    }

    // Regular user validation (only if not admin)
    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length < 2) {
      setError('الرجاء إدخال الاسم الأول واسم العائلة');
      return;
    }

    if (phoneNumber.startsWith('0')) {
      setError('كلمة المرور يجب أن تبدأ بـ 5 (بدون صفر في البداية)');
      return;
    }

    if (phoneNumber.length < 9) {
      setError('الرجاء إدخال رقم هاتف صحيح (9 أرقام)');
      return;
    }

    setLoading(true);
    try {
      console.log('⚡ Regular user login - getting data quickly');
      const data = await api.login(fullName, phoneNumber);
      localStorage.setItem('token', data.token);
      
      // التنقل فوراً بعد تسجيل الدخول الناجح
      onLogin(data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول. تأكد من البيانات.');
    } finally {
      setLoading(false);
    }
  };

  // Update admin mode check on input change
  const handleNameChange = (value: string) => {
    setFullName(value);
    checkAdminMode(value, phoneNumber);
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    checkAdminMode(fullName, value);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className={`h-16 w-16 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-300 ${
            isAdminMode ? 'bg-red-600' : 'bg-primary-600'
          }`}>
            {isAdminMode ? (
              <Shield className="text-white h-8 w-8" />
            ) : (
              <span className="text-white text-2xl font-bold">م</span>
            )}
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isAdminMode ? 'تسجيل دخول الإدمن' : 'تسجيل الدخول'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isAdminMode ? 'لوحة تحكم المدير' : 'منصة إدارة المحافظ الاستثمارية'}
        </p>
        {isAdminMode && (
          <div className="mt-2 text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <Shield className="h-3 w-3 ml-1" />
              وضع الإدمن
            </span>
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border transition-colors duration-300 ${
          isAdminMode ? 'border-red-200' : 'border-gray-100'
        }`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                {isAdminMode ? 'اسم المدير' : 'الاسم (الأول والأخير)'}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {isAdminMode ? (
                    <Shield className="h-5 w-5 text-red-400" />
                  ) : (
                    <User className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className={`block w-full pr-10 rounded-md focus:ring-2 focus:ring-offset-2 sm:text-sm p-3 border transition-colors duration-300 ${
                    isAdminMode 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  placeholder={isAdminMode ? 'مدير النظام الرئيسي' : 'الاسم الأول واسم العائلة'}
                  value={fullName}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                {isAdminMode ? 'كلمة مرور الإدمن' : 'رقم الجوال (كلمة المرور)'}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${isAdminMode ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type={isAdminMode ? 'password' : 'tel'}
                  required
                  className={`block w-full pr-10 rounded-md focus:ring-2 focus:ring-offset-2 sm:text-sm p-3 border transition-colors duration-300 ${
                    isAdminMode 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  placeholder={isAdminMode ? 'admin123' : '5xxxxxxxx'}
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="mr-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Admin hint - REMOVED for security */}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 ${
                  isAdminMode
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                }`}
              >
                {loading ? (
                  isAdminMode ? 'جاري التحقق من صلاحيات الإدمن...' : 'جاري التحقق...'
                ) : (
                  isAdminMode ? 'دخول لوحة الإدمن' : 'تسجيل الدخول'
                )}
                {!loading && <ArrowRight className="mr-2 h-5 w-5" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
