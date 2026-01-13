
import React from 'react';
import { SUBSCRIPTION_FEE_AED } from '../constants.ts';
import { User } from '../types.ts';

interface ProfileProps {
  user: User | null;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
        <h2 className="text-2xl font-bold">{user.name}</h2>
        <p className="text-slate-500">ড্রাইভার আইডি: {user.id}</p>
        
        <div className="mt-8 grid grid-cols-2 gap-4 text-left">
          <div className="p-4 bg-slate-50 rounded-2xl">
             <p className="text-xs text-slate-400 uppercase">গাড়ির নম্বর</p>
             <p className="font-bold">#{user.carSideNumber}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
             <p className="text-xs text-slate-400 uppercase">মোবাইল</p>
             <p className="font-bold">{user.mobileNumber}</p>
          </div>
        </div>
      </div>

      <button onClick={onLogout} className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl border border-red-100">
         Log Out (লগ আউট)
      </button>
    </div>
  );
};

export default Profile;
