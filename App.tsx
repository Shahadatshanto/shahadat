
import React, { useState, useEffect } from 'react';
import { CalculatedShift, User } from './types.ts';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import History from './components/History.tsx';
import Profile from './components/Profile.tsx';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'profile'>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [shifts, setShifts] = useState<CalculatedShift[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({ 
    id: '', 
    password: '', 
    confirmPassword: '',
    name: '', 
    carSideNumber: '', 
    mobileNumber: '' 
  });
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('taxi_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      const savedShifts = localStorage.getItem(`taxi_shifts_${parsedUser.id}`);
      if (savedShifts) setShifts(JSON.parse(savedShifts));
    }
  }, []);

  const saveShifts = (newShifts: CalculatedShift[]) => {
    if (!user) return;
    setShifts(newShifts);
    localStorage.setItem(`taxi_shifts_${user.id}`, JSON.stringify(newShifts));
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError(null);

    const usersDb = JSON.parse(localStorage.getItem('taxi_users_db') || '[]');

    setTimeout(() => {
      if (isRegistering) {
        if (authForm.password !== authForm.confirmPassword) {
          setAuthError("Passwords do not match.");
          setIsAuthLoading(false);
          return;
        }

        const userExists = usersDb.find((u: any) => u.id === authForm.id);
        if (userExists) {
          setAuthError("Driver ID already registered.");
          setIsAuthLoading(false);
          return;
        }

        const newUser = { 
          id: authForm.id, 
          name: authForm.name, 
          password: authForm.password,
          carSideNumber: authForm.carSideNumber,
          mobileNumber: authForm.mobileNumber,
          isSubscribed: true 
        };
        
        usersDb.push(newUser);
        localStorage.setItem('taxi_users_db', JSON.stringify(usersDb));
        
        const { password, ...userSession } = newUser;
        setUser(userSession as User);
        localStorage.setItem('taxi_user', JSON.stringify(userSession));
      } else {
        const existingUser = usersDb.find((u: any) => u.id === authForm.id && u.password === authForm.password);
        if (existingUser) {
          const { password, ...userSession } = existingUser;
          setUser(userSession as User);
          localStorage.setItem('taxi_user', JSON.stringify(userSession));
          const savedShifts = localStorage.getItem(`taxi_shifts_${userSession.id}`);
          setShifts(savedShifts ? JSON.parse(savedShifts) : []);
        } else {
          setAuthError("Invalid Driver ID or Password.");
        }
      }
      setIsAuthLoading(false);
    }, 1200);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('taxi_user');
    setShifts([]);
  };

  const addShift = (shift: CalculatedShift) => {
    const newShifts = [...shifts, shift];
    saveShifts(newShifts);
    setActiveTab('history');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full py-8">
          <div className="text-center mb-8">
            <div className="bg-yellow-400 text-black w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-3xl font-black shadow-lg mb-4">TX</div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">TaxiShift <span className="text-blue-600">Pro</span></h1>
            <p className="text-slate-500 mt-2 font-medium">
              {isRegistering ? 'নতুন অ্যাকাউন্ট খুলুন' : 'ট্যাক্সি ড্রাইভারদের স্মার্ট হিসাব রক্ষক'}
            </p>
          </div>
          
          <form onSubmit={handleAuth} className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 space-y-4">
            {authError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100">
                {authError}
              </div>
            )}

            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input type="text" placeholder="আপনার নাম লিখুন" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Driver ID</label>
                    <input type="text" placeholder="ID লিখুন" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" value={authForm.id} onChange={e => setAuthForm({...authForm, id: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Car Side No.</label>
                    <input type="text" placeholder="গাড়ির নম্বর" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" value={authForm.carSideNumber} onChange={e => setAuthForm({...authForm, carSideNumber: e.target.value})} />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Driver ID</label>
              <input type="text" placeholder="আপনার ড্রাইভার আইডি" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" value={authForm.id} onChange={e => setAuthForm({...authForm, id: e.target.value})} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
              <input type="password" placeholder="••••••••" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
            </div>

            <button type="submit" disabled={isAuthLoading} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.98] disabled:opacity-70 flex justify-center items-center mt-2">
              {isAuthLoading ? 'প্রসেসিং হচ্ছে...' : (isRegistering ? 'রেজিস্টার করুন' : 'লগইন করুন')}
            </button>
            
            <div className="pt-4 text-center border-t border-slate-50">
              <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-sm font-bold text-blue-600">
                {isRegistering ? 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন' : "নতুন অ্যাকাউন্ট তৈরি করতে এখানে ক্লিক করুন"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user}>
      {activeTab === 'dashboard' && <Dashboard shifts={shifts} onAddShift={addShift} />}
      {activeTab === 'history' && <History shifts={shifts} />}
      {activeTab === 'profile' && <Profile user={user} onLogout={handleLogout} />}
    </Layout>
  );
};

export default App;
