import React from 'react'
import ReactDOM from 'react-dom/client'
import './backup-styles.css'

// Simple test component
const TestApp = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const fullName = formData.get('fullName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;

    console.log('محاولة تسجيل دخول:', fullName, phoneNumber);

    // Check admin
    if (fullName === 'مدير النظام الرئيسي' && phoneNumber === 'admin123') {
      setUser({ fullName, isAdmin: true });
      setIsLoggedIn(true);
      return;
    }

    // Check regular users
    const users: any = {
      'جعفر طاهر الزبر': {
        phoneNumber: '534000223',
        subscriberNumber: '1',
        sharesCount: 42,
        totalSavings: 38100,
        realPortfolioValue: 38090.89,
        ownershipPercentage: 20.49
      }
    };

    if (users[fullName] && users[fullName].phoneNumber === phoneNumber) {
      setUser({ fullName, ...users[fullName] });
      setIsLoggedIn(true);
    } else {
      alert('بيانات تسجيل الدخول غير صحيحة');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  if (isLoggedIn && user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center ml-3">
                  <span className="text-white text-xl font-bold">م</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">لوحة التحكم</h1>
              </div>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                تسجيل خروج
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              مرحباً {user.fullName}
            </h2>
            
            {user.isAdmin ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">إجمالي المشتركين</p>
                  <p className="text-lg font-bold text-gray-900">21 مشترك</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">إجمالي الأسهم</p>
                  <p className="text-lg font-bold text-gray-900">205 سهم</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">قيمة المحفظة</p>
                  <p className="text-lg font-bold text-gray-900">185,466 ر.س</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">عدد الشركات</p>
                  <p className="text-lg font-bold text-gray-900">8 شركات</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">رقم المشترك</p>
                  <p className="text-lg font-bold text-gray-900">{user.subscriberNumber}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">عدد الأسهم</p>
                  <p className="text-lg font-bold text-gray-900">{user.sharesCount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">إجمالي المدخرات</p>
                  <p className="text-lg font-bold text-gray-900">{user.totalSavings?.toLocaleString()} ر.س</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">قيمة المحفظة</p>
                  <p className="text-lg font-bold text-gray-900">{user.realPortfolioValue?.toLocaleString()} ر.س</p>
                </div>
              </div>
            )}
          </div>

          {/* Portfolio Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">تفاصيل المحفظة</h3>
            <div className="space-y-4">
              {[
                { name: 'يغطي الأسهم الامريكية الكبرى (S&P500)', value: 49594.58, profit: 1624.22 },
                { name: 'يغطي قطاع التكنلوجيا العالمي', value: 15013.39, profit: 167.57 },
                { name: 'الأسواق المتقدمة والناشئة', value: 439.65, profit: -13.76 },
                { name: 'البيتكوين', value: 8192.03, profit: -349.46 },
                { name: 'الذهب', value: 6840.71, profit: -175.81 },
                { name: 'الصكوك', value: 58467.00, profit: 1667 },
                { name: 'صندوق معايير للقروض', value: 40119.00, profit: 2119 },
                { name: 'الوديعة البنكية', value: 6800.00, profit: 0 }
              ].map((company, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{company.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">{company.value.toLocaleString()} ر.س</p>
                    <p className={`text-sm ${company.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {company.profit >= 0 ? '+' : ''}{company.profit.toLocaleString()} ر.س
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-gray-900">إجمالي قيمة المحفظة</p>
                <p className="text-xl font-bold text-primary-700">185,466.35 ر.س</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">م</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">تسجيل الدخول</h2>
          <p className="mt-2 text-sm text-gray-600">منصة إدارة المحافظ الاستثمارية</p>
        </div>

        <div className="bg-white py-8 px-4 shadow rounded-lg border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="جعفر طاهر الزبر"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                رقم الجوال
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="534000223"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                تسجيل الدخول
              </button>
            </div>
          </form>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                const nameInput = document.getElementById('fullName') as HTMLInputElement;
                const phoneInput = document.getElementById('phoneNumber') as HTMLInputElement;
                nameInput.value = 'مدير النظام الرئيسي';
                phoneInput.value = 'admin123';
              }}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              تسجيل دخول إدمن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Initialize App
console.log('🚀 تطبيق الاختبار يتم تحميله...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
)

console.log('✅ تطبيق الاختبار تم تحميله بنجاح');