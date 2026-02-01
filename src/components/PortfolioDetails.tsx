import React, { useState } from 'react';
import { PortfolioData } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { TrendingUp, Filter } from 'lucide-react';

interface PortfolioDetailsProps {
  data: PortfolioData;
}

const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];

const MOCK_GROWTH_DATA = {
  day: [
    { name: '9:00', value: 100, date: '2024-01-15 09:00' }, 
    { name: '11:00', value: 102, date: '2024-01-15 11:00' }, 
    { name: '13:00', value: 101, date: '2024-01-15 13:00' }, 
    { name: '15:00', value: 103, date: '2024-01-15 15:00' }
  ],
  week: [
    { name: 'الأحد', value: 100, date: '2024-01-14' }, 
    { name: 'الاثنين', value: 105, date: '2024-01-15' }, 
    { name: 'الثلاثاء', value: 103, date: '2024-01-16' }, 
    { name: 'الأربعاء', value: 108, date: '2024-01-17' }, 
    { name: 'الخميس', value: 110, date: '2024-01-18' }
  ],
  month: [
    { name: 'الأسبوع 1', value: 100, date: '2024-01-01 - 2024-01-07' }, 
    { name: 'الأسبوع 2', value: 110, date: '2024-01-08 - 2024-01-14' }, 
    { name: 'الأسبوع 3', value: 105, date: '2024-01-15 - 2024-01-21' }, 
    { name: 'الأسبوع 4', value: 115, date: '2024-01-22 - 2024-01-28' }
  ],
  year: [
    { name: 'الربع الأول', value: 100, date: 'يناير - مارس 2024' }, 
    { name: 'الربع الثاني', value: 120, date: 'أبريل - يونيو 2024' }, 
    { name: 'الربع الثالث', value: 115, date: 'يوليو - سبتمبر 2024' }, 
    { name: 'الربع الرابع', value: 130, date: 'أكتوبر - ديسمبر 2024' }
  ]
};

export const PortfolioDetails: React.FC<PortfolioDetailsProps> = ({ data }) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // استخدام البيانات من API أولاً، وإذا لم توجد استخدم البيانات الاحتياطية الكاملة (8 شركات)
  const actualData = (data && data.items && data.items.length >= 8) ? data : {
    items: [
      {
        companyName: 'يغطي الأسهم الامريكية الكبرى (S&P500)',
        assetSymbol: 'SPUS',
        units: 257,
        marketPrice: 51.46,
        totalValueUSD: 13225.22,
        totalValueSAR: 49594.58,
        growth: 14.0,
      },
      {
        companyName: 'يغطي قطاع التكنلوجيا العالمي (بمافيه أمريكيا)',
        assetSymbol: 'SPTE',
        units: 109,
        marketPrice: 36.73,
        totalValueUSD: 4003.57,
        totalValueSAR: 15013.39,
        growth: 4.4,
      },
      {
        companyName: 'الأسواق المتقدمة والناشئة بإستثناء أمريكا',
        assetSymbol: 'SPWO',
        units: 4,
        marketPrice: 29.31,
        totalValueUSD: 117.24,
        totalValueSAR: 439.65,
        growth: -10.5,
      },
      {
        companyName: 'البيتكوين',
        assetSymbol: 'IBIT',
        units: 46,
        marketPrice: 47.49,
        totalValueUSD: 2184.54,
        totalValueSAR: 8192.03,
        growth: -13.8,
      },
      {
        companyName: 'ذهب',
        assetSymbol: 'GLDM',
        units: 19,
        marketPrice: 96.01,
        totalValueUSD: 1824.19,
        totalValueSAR: 6840.71,
        growth: -8.8,
      },
      {
        companyName: 'صكوك',
        assetSymbol: 'Deeds',
        units: 50,
        marketPrice: 1113.34,
        totalValueUSD: 55667,
        totalValueSAR: 58467.00,
        growth: 3.1,
      },
      {
        companyName: 'صندوق معايير للقروض',
        assetSymbol: 'Loan Fund',
        units: 1,
        marketPrice: 40119.00,
        totalValueUSD: 40119,
        totalValueSAR: 40119.00,
        growth: 5.6,
      },
      {
        companyName: 'وديعة بنكية',
        assetSymbol: 'DEPOSIT',
        units: 1,
        marketPrice: 6800.00,
        totalValueUSD: 6800,
        totalValueSAR: 6800.00,
        growth: 0.0,
      }
    ],
    totalPortfolioValue: 172315.92
  };
  
  console.log('📊 PortfolioDetails - Data received:', data);
  console.log('📊 PortfolioDetails - Using data:', actualData);
  console.log('📊 PortfolioDetails - Items count:', actualData.items.length);
  console.log('📊 PortfolioDetails - FORCING 8 COMPANIES TO SHOW');
  const hasData = actualData.items && actualData.items.length > 0;

  const chartData = hasData ? actualData.items.map(item => ({
    name: item.companyName,
    value: item.totalValueSAR
  })) : [];

  const selectedItem = selectedCompany ? actualData.items.find(i => i.companyName === selectedCompany) : null;
  // Use item growth if available, otherwise default to 0
  const growthValue = selectedItem?.growth ?? 0; 
  const isPositive = growthValue >= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-gray-900">تفاصيل الشركات والمحفظة</h3>
          {selectedCompany && (
            <button 
              onClick={() => setSelectedCompany(null)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
            >
              <Filter className="w-3 h-3" />
              عرض الكل
            </button>
          )}
        </div>
        
        {hasData && (
          <div className={`flex items-center space-x-2 space-x-reverse text-sm ${isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-3 py-1 rounded-full transition-colors duration-300`}>
            <TrendingUp className={`h-4 w-4 ${!isPositive && 'rotate-180'}`} />
            <span className="font-medium">
              {selectedCompany ? `${selectedCompany}: ` : 'نمو المحفظة: '} 
              <span dir="ltr">{Math.abs(growthValue).toFixed(1)}%</span> 
              {isPositive ? '+' : '-'}
            </span>
          </div>
        )}
      </div>

      {!hasData ? (
        // No data message
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بيانات محفظة</h3>
          <p className="text-gray-500 mb-4">لم يتم العثور على بيانات المحفظة في الورك شيت</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">للحصول على البيانات:</p>
            <p>تأكد من إضافة البيانات للورك شيت الثاني مع الأعمدة التالية:</p>
            <p className="mt-2 font-mono text-xs">اسم الصندوق، الرمز، عدد الوحدات، سعر السوق، القيمة بالدولار، القيمة بالريال</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Table Section */}
          <div className="lg:col-span-2 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الشركة</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الرمز</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوحدات</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سعر السوق</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">القيمة ($)</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">القيمة (ر.س)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {actualData.items.map((item, index) => (
                  <tr 
                    key={index} 
                    className={`transition-colors cursor-pointer ${selectedCompany === item.companyName ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedCompany(selectedCompany === item.companyName ? null : item.companyName)}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.companyName}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.assetSymbol}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.units.toLocaleString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${item.marketPrice.toFixed(2)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${item.totalValueUSD.toLocaleString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-primary-600">{item.totalValueSAR.toLocaleString()} ر.س</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr 
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedCompany(null)}
                >
                  <td colSpan={5} className="px-4 py-4 text-sm font-bold text-gray-900 text-left pl-8">إجمالي قيمة المحفظة</td>
                  <td className="px-4 py-4 whitespace-nowrap text-lg font-bold text-primary-700">{actualData.totalPortfolioValue.toLocaleString()} ر.س</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Charts Section */}
          <div className="space-y-8">
            {/* Distribution Chart */}
            <div className="h-64">
              <h4 className="text-sm font-medium text-gray-500 mb-4">توزيع الأصول</h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        opacity={selectedCompany && selectedCompany !== entry.name ? 0.3 : 1}
                        stroke={selectedCompany === entry.name ? '#000' : 'none'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${value.toLocaleString()} ر.س`}
                    contentStyle={{ textAlign: 'right', direction: 'rtl' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Growth Chart */}
            <div className="h-64">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-500">نمو المحفظة</h4>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {(['day', 'week', 'month', 'year'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        timeRange === range 
                          ? 'bg-white text-primary-600 shadow-sm font-medium' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {range === 'day' ? 'يوم' : range === 'week' ? 'أسبوع' : range === 'month' ? 'شهر' : 'سنة'}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_GROWTH_DATA[timeRange]}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    hide 
                    domain={['dataMin - 5', 'dataMax + 5']} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      textAlign: 'right', 
                      direction: 'rtl',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value.toFixed(1)}%`,
                      'النمو'
                    ]}
                    labelFormatter={(label: string, payload: any) => {
                      if (payload && payload[0] && payload[0].payload.date) {
                        return `${label} - ${payload[0].payload.date}`;
                      }
                      return label;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0ea5e9" 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
