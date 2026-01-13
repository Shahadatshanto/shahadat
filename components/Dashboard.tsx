
import React, { useState } from 'react';
import { CalculatedShift } from '../types.ts';
import { formatAED, calculateShift } from '../utils/calculations.ts';
import { extractShiftDataFromImage } from '../services/geminiService.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  shifts: CalculatedShift[];
  onAddShift: (shift: CalculatedShift) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ shifts, onAddShift }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const rawData = await extractShiftDataFromImage(base64);
        const calculated = calculateShift(rawData);
        onAddShift(calculated);
      } catch (err: any) {
        setError(err.message || "কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const totalCleanMoney = shifts.reduce((sum, s) => sum + s.cleanMoney, 0);
  const avgPercentage = shifts.length > 0 
    ? shifts.reduce((sum, s) => sum + s.dailyPercentage, 0) / shifts.length 
    : 0;

  const chartData = shifts.slice(-7).map(s => ({
    name: new Date(s.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
    income: s.shiftTotalIncome,
    clean: s.cleanMoney
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-medium uppercase">Clean Money (মোট লাভ)</p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">{formatAED(totalCleanMoney)}</h2>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-xs font-medium uppercase">Avg Percentage (%)</p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">{avgPercentage.toFixed(1)}%</h2>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl">
        <h3 className="text-xl font-bold">নতুন শিফট যোগ করুন</h3>
        <p className="text-blue-100 text-sm mt-1">সামারি ফটোর ছবি তুলুন বা আপলোড করুন।</p>
        <div className="mt-6">
          <label className="bg-white text-blue-700 px-6 py-3 rounded-full font-bold shadow-md cursor-pointer inline-flex items-center hover:bg-blue-50">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            ফটো স্ক্যান করুন
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={loading} />
          </label>
        </div>
      </div>

      {loading && (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="font-medium text-slate-700">বিশ্লেষণ করা হচ্ছে...</p>
          <p className="text-xs text-slate-400 mt-2">Gemini AI আপনার ডেটা প্রসেস করছে</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-start space-x-3">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {shifts.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase">সাপ্তাহিক রিপোর্ট</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="income" name="Income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clean" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
