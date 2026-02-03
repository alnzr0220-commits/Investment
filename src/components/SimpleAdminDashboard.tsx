import React, { useState, useEffect } from 'react';
import { Database, LogOut, Search, User, Eye, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export const SimpleAdminDashboard: React.FC = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const subs = await api.getAllSubscribers();
      console.log('✅ Admin: Loaded', subs.length, 'subscribers');
      setSubscribers(subs);
    } catch (err) {
      console.error('❌ Admin: Failed to load subscribers:', err);
      setError('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const query = searchQuery.toLowerCase();
    return (
      (sub.fullName || '').toLowerCase().includes(query) ||
      (sub.phoneNumber || '').includes(query) ||
      (sub.subscriberNumber || '').toLowerCase().includes(query)
    );
  });

  const handleViewUser = (subscriber: any) => {
    // Navigate to view page with state
    navigate(`/admin/view/${subscriber.subscriberNumber}`, { state: { subscriber } });
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <nav className="bg-gray-900 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-indigo-500" />
              <span className="mr-3 text-white font-bold text-lg">لوحة الإدمن</span>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <button 
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none transition-colors duration-150"
              >
                <LogOut className="h-4 w-4 ml-2" />
                خروج
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">إجمالي المشتركين</dt>
                      <dd className="text-lg font-medium text-gray-900">{subscribers.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative rounded-md shadow-sm max-w-md">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md p-3 border"
                placeholder="بحث بالاسم أو رقم الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المشترك
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الأسهم
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          قيمة المحفظة
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">عرض</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                            جاري التحميل...
                          </td>
                        </tr>
                      ) : filteredSubscribers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                            {subscribers.length === 0 ? 'لا يوجد مشتركين' : 'لا توجد نتائج للبحث'}
                          </td>
                        </tr>
                      ) : (
                        filteredSubscribers.map((subscriber, index) => (
                          <tr key={subscriber.subscriberNumber || index} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                    {subscriber.fullName ? subscriber.fullName.charAt(0) : 'م'}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{subscriber.fullName || 'غير محدد'}</div>
                                  <div className="text-sm text-gray-500">{subscriber.phoneNumber || 'غير محدد'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {subscriber.sharesCount || 0} سهم
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {(subscriber.realPortfolioValue || 0).toLocaleString()} SAR
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                onClick={() => handleViewUser(subscriber)}
                                className="text-indigo-600 hover:text-indigo-900 flex items-center"
                              >
                                <Eye className="h-4 w-4 ml-1" />
                                عرض التفاصيل
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};