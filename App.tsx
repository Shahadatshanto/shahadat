
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
    mobileNumber: '',
  });
  const [authError, setAuthError] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('taxi_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        const savedShifts = localStorage.getItem(`taxi_shifts_${parsedUser.id}`);
        if (savedShifts) setShifts(JSON.parse(savedShifts));
      }
    } catch (e) {
      console.error("Error loading user from storage", e);
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

    // Get current DB from localStorage
    const usersDb = JSON.parse(localStorage.getItem('taxi_users_db') || '[]');

    // Simulate network delay for better UX
    setTimeout(() => {
      try {
        if (isRegistering) {
          // Validation for registration
          if (!authForm.id || !authForm.password || !authForm.name) {
            setAuthError("সবগুলো ঘর অবশ্যই পূরণ করুন।");
            setIsAuthLoading(false);
            return;
          }

          if (authForm.password !== authForm.confirmPassword) {
            setAuthError("পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মেলেনি!");
            setIsAuthLoading(false);
            return;
          }

          const userExists = usersDb.find((u: any) => u.id === authForm.id);
          if (userExists) {
            setAuthError("এই ড্রাইভার আইডি ইতিমধ্যে ব্যবহার করা হয়েছে।");
            setIsAuthLoading(false);
            return;
          }

          const newUser = { 
            id: authForm.id, 
            name: authForm.name, 
            password: authForm.password,
            carSideNumber: authForm.carSideNumber || 'N/A',
            mobileNumber: authForm.mobileNumber || 'N/A',
            isSubscribed: true 
          };
          
          usersDb.push(newUser);
          localStorage.setItem('taxi_users_db', JSON.stringify(usersDb));
          
          const { password, ...userSession } = newUser;
          setUser(userSession as User);
          localStorage.setItem('taxi_user', JSON.stringify(userSession));
          console.log("Registration successful for ID:", authForm.id);
        } else {
          // Login logic
          const existingUser = usersDb.find((u: any) => u.id === authForm.id && u.password === authForm.password);
          if (existingUser) {
            const { password, ...userSession } = existingUser;
            setUser(userSession as User);
            localStorage.setItem('taxi_user', JSON.stringify(userSession));
            const savedShifts = localStorage.getItem(`taxi_shifts_${userSession.id}`);
            setShifts(savedShifts ? JSON.parse(savedShifts) : []);
            console.log("Login successful for ID:", authForm.id);
          } else {
            setAuthError("ভুল আইডি অথবা পাসওয়ার্ড দিয়েছেন।");
          }
        }
      } catch (err) {
        console.error("Auth Error:", err);
        setAuthError("একটি সিস্টেম এরর হয়েছে। আবার চেষ্টা করুন।");
      } finally {
        setIsAuthLoading(false);
      }
    }, 800);
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
            <div className="bg-yellow-400 text-black w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-3xl font-black shadow-lg mb-4 animate-bounce">TX</div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">TaxiShift <span className="text-blue-600">Pro</span></h1>
            <p className="text-slate-500 mt-2 font-medium">
              {isRegistering ? 'নতুন অ্যাকাউন্ট খুলুন' : 'ট্যাক্সি ড্রাইভারদের স্মার্ট হিসাব রক্ষক'}
            </p>
          </div>
          
          <form onSubmit={handleAuth} className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 space-y-4">
            {authError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 text-center animate-pulse">
                {authError}
              </div>
            )}

            {isRegistering ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name (আপনার নাম)</label>
                  <input type="text" placeholder="পুরো নাম লিখুন" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Driver ID</label>
                    <input type="text" placeholder="আইডি" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" value={authForm.id} onChange={e => setAuthForm({...authForm, id: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Car Side No.</label>
                    <input type="text" placeholder="গাড়ির নম্বর" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" value={authForm.carSideNumber} onChange={e => setAuthForm({...authForm, carSideNumber: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password (পাসওয়ার্ড)</label>
                  <input type="password" placeholder="••••••••" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Confirm Password (নিশ্চিত করুন)</label>
                  <input type="password" placeholder="••••••••" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" value={authForm.confirmPassword} onChange={e => setAuthForm({...authForm, confirmPassword: e.target.value})} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Driver ID (আইডি)</label>
                  <input type="text" placeholder="ড্রাইভার আইডি" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" value={authForm.id} onChange={e => setAuthForm({...authForm, id: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password (পাসওয়ার্ড)</label>
                  <input type="password" placeholder="••••••••" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
                </div>
              </>
            )}

            <button type="submit" disabled={isAuthLoading} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.98] disabled:opacity-70 flex justify-center items-center mt-2 hover:bg-slate-800 transition-colors">
              {isAuthLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  অপেক্ষা করুন...
                </div>
              ) : (isRegistering ? 'রেজিস্টার করুন' : 'লগইন করুন')}
            </button>
            
            <div className="pt-4 text-center border-t border-slate-50">
              <button type="button" onClick={() => { setIsRegistering(!isRegistering); setAuthError(null); }} className="text-sm font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4">
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
