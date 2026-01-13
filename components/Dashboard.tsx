
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
  const [error, setError] = useState<{message: string, isKeyError: boolean} | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError({message: "ছবির সাইজ অনেক বড় (৮ মেগাবাইটের কম হতে হবে)।", isKeyError: false});
      return;
    }

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
        const isKeyErr = err.message.includes("API_KEY") || err.message.includes("403") || err.message.includes("valid");
        setError({
          message: err.message || "কোনো অজানা সমস্যা হয়েছে।",
          isKeyError: isKeyErr
        });
      } finally {
        setLoading(false);
        event.target.value = '';
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
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Clean Money (মোট লাভ)</p>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{formatAED(totalCleanMoney)}</h2>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Avg Percentage (%)</p>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{avgPercentage.toFixed(1)}%</h2>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10">
          <h3 className="text-lg font-bold">শিফট স্ক্যান করুন</h3>
          <p className="text-slate-400 text-xs mt-1">সামারি রিপোর্টের ছবি তুললে অটোমেটিক হিসাব হয়ে যাবে।</p>
          <div className="mt-6">
            <label className={`bg-yellow-400 text-black px-6 py-3.5 rounded-2xl font-black shadow-lg cursor-pointer inline-flex items-center hover:bg-yellow-300 transition-all active:scale-95 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {loading ? 'প্রসেসিং হচ্ছে...' : 'ক্যামেরা খুলুন'}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={loading} />
            </label>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      </div>

      {loading && (
        <div className="bg-white p-8 rounded-3xl border border-blue-100 text-center shadow-sm animate-pulse">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold text-slate-800">AI রিপোর্টটি পড়ছে...</p>
          <p className="text-xs text-slate-400 mt-1">কয়েক সেকেন্ড অপেক্ষা করুন</p>
        </div>
      )}

      {error && (
        <div className={`p-5 rounded-3xl border shadow-sm animate-in fade-in duration-300 ${error.isKeyError ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div className="text-sm">
              <p className="font-bold">{error.isKeyError ? 'কনফিগারেশন সমস্যা' : 'স্ক্যানিং এরর'}</p>
              <p className="mt-1 leading-relaxed">{error.message}</p>
              {error.isKeyError && (
                <div className="mt-3 p-3 bg-white/50 rounded-xl text-xs border border-amber-200">
                  <strong>সমাধান:</strong> Netlify-তে আপনার সাইট ড্যাশবোর্ডে গিয়ে Environment Variables সেকশনে <code>API_KEY</code> নামে আপনার কি-টি বসান এবং সাইটটি আবার Deploy করুন।
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {shifts.length > 0 && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest">আয়ের গ্রাফ (শেষ ৭ দিন)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}
                  cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="income" name="মোট আয়" fill="#0f172a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="clean" name="নিট লাভ" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
